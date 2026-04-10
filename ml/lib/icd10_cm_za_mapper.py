#!/usr/bin/env python3
"""
ICD-10-CM to ICD-10-ZA Mapper
===============================
Maps US ICD-10-CM codes (used in public benchmarks like ACI-Note, MDACE)
to South African ICD-10-ZA codes (used by our engine).

Strategy:
  ICD-10-CM is a US expansion of WHO ICD-10. SA's ICD-10-ZA is also derived
  from WHO ICD-10. Most 3-character category codes are identical across all
  variants. CM adds 4th-7th character specificity that ZA may not have.

  Mapping priority:
    1. Exact match — CM code exists verbatim in ZA
    2. Prefix match — truncate CM code progressively until a ZA match is found
    3. Unmapped — no ZA equivalent found

Data source:
  /Users/hga/netcare-healthos/docs/knowledge/databases/ICD-10_MIT_2021.csv
  Columns: ICD10_Code (index 7), WHO_Full_Desc (index 8)

No external dependencies — stdlib + csv only.
"""

from __future__ import annotations

import csv
import os
from collections import defaultdict
from typing import Optional


# ---------------------------------------------------------------------------
# Default CSV path
# ---------------------------------------------------------------------------

_DEFAULT_CSV = os.path.join(
    os.path.expanduser("~"),
    "netcare-healthos", "docs", "knowledge", "databases", "ICD-10_MIT_2021.csv",
)


# ---------------------------------------------------------------------------
# Mapper class
# ---------------------------------------------------------------------------

class ICD10CmZaMapper:
    """Maps ICD-10-CM codes to ICD-10-ZA codes using the MIT 2021 ZA code list."""

    def __init__(self, csv_path: str = _DEFAULT_CSV):
        """Initialize the mapper by loading the ZA code list.

        Args:
            csv_path: Path to ICD-10_MIT_2021.csv.
        """
        self.csv_path = csv_path
        self.za_codes: set[str] = set()
        self.za_descriptions: dict[str, str] = {}
        self.prefix_index: dict[str, set[str]] = defaultdict(set)
        self._loaded = False

        self._load()

    def _load(self) -> None:
        """Load ZA codes from CSV into lookup structures."""
        if not os.path.exists(self.csv_path):
            raise FileNotFoundError(
                f"ICD-10 ZA code list not found at {self.csv_path}. "
                "Download from the project docs/knowledge/databases/ directory."
            )

        with open(self.csv_path, newline="", encoding="utf-8") as f:
            reader = csv.reader(f)
            header = next(reader)  # skip header

            # Find column indices by name for robustness
            try:
                code_idx = header.index("ICD10_Code")
            except ValueError:
                code_idx = 7  # fallback to known position

            try:
                desc_idx = header.index("WHO_Full_Desc")
            except ValueError:
                desc_idx = 8

            for row in reader:
                if len(row) <= max(code_idx, desc_idx):
                    continue

                code = row[code_idx].strip().upper()
                desc = row[desc_idx].strip()

                if not code:
                    continue

                self.za_codes.add(code)
                self.za_descriptions[code] = desc

                # Index by 3-char prefix for prefix matching
                prefix = code[:3] if len(code) >= 3 else code
                self.prefix_index[prefix].add(code)

        self._loaded = True

    @property
    def code_count(self) -> int:
        """Number of ZA codes loaded."""
        return len(self.za_codes)

    def _normalize_code(self, code: str) -> str:
        """Normalize a code to dotted uppercase form."""
        code = code.strip().upper()
        if '.' not in code and len(code) > 3:
            code = code[:3] + '.' + code[3:]
        return code

    def map_cm_to_za(self, cm_code: str) -> tuple[str, str]:
        """Map a single ICD-10-CM code to its best ICD-10-ZA equivalent.

        Args:
            cm_code: An ICD-10-CM code (e.g., "E11.9", "E119", "M54.5").

        Returns:
            Tuple of (za_code, mapping_type) where mapping_type is one of:
              - "exact": CM code exists verbatim in ZA
              - "prefix_match": Truncated CM code found in ZA
              - "unmapped": No ZA equivalent found
        """
        normalized = self._normalize_code(cm_code)

        # 1. Exact match
        if normalized in self.za_codes:
            return (normalized, "exact")

        # 2. Progressive prefix truncation
        # For a code like "E11.65" try: E11.6, E11, E1
        # Remove characters from the end, skipping dots
        candidate = normalized
        while len(candidate) > 2:
            # Remove last character
            candidate = candidate[:-1]
            # Skip trailing dot
            if candidate.endswith('.'):
                candidate = candidate[:-1]

            if candidate in self.za_codes:
                return (candidate, "prefix_match")

        # 3. Check if the 3-char prefix has ANY codes in ZA
        prefix = normalized[:3]
        if prefix in self.prefix_index:
            # Return the most general code (shortest) under this prefix
            candidates = sorted(self.prefix_index[prefix], key=len)
            return (candidates[0], "prefix_match")

        return (cm_code, "unmapped")

    def map_code_set(self, cm_codes: set[str]) -> tuple[set[str], dict]:
        """Map a full set of ICD-10-CM codes to ZA equivalents.

        Args:
            cm_codes: Set of ICD-10-CM codes.

        Returns:
            Tuple of:
              - set of ZA codes
              - mapping_stats dict with counts: exact, prefix_match, unmapped,
                total, success_rate, and per-code details
        """
        za_codes = set()
        stats = {
            "exact": 0,
            "prefix_match": 0,
            "unmapped": 0,
            "total": len(cm_codes),
            "details": {},
        }

        for cm_code in cm_codes:
            za_code, mapping_type = self.map_cm_to_za(cm_code)
            za_codes.add(za_code)
            stats[mapping_type] += 1
            stats["details"][cm_code] = {
                "za_code": za_code,
                "mapping_type": mapping_type,
            }

        mapped = stats["exact"] + stats["prefix_match"]
        stats["success_rate"] = round(mapped / stats["total"], 4) if stats["total"] > 0 else 0.0

        return (za_codes, stats)

    def describe(self, code: str) -> Optional[str]:
        """Get the WHO description for a ZA code, or None if not found."""
        normalized = self._normalize_code(code)
        return self.za_descriptions.get(normalized)

    def get_category_codes(self, prefix: str) -> set[str]:
        """Get all ZA codes under a 3-char category prefix.

        Args:
            prefix: 3-character ICD-10 category (e.g., "E11", "J44").

        Returns:
            Set of all ZA codes starting with that prefix.
        """
        return set(self.prefix_index.get(prefix.upper(), set()))

    def format_mapping_report(self, stats: dict) -> str:
        """Format a human-readable mapping report.

        Args:
            stats: The mapping_stats dict from map_code_set().

        Returns:
            Formatted multi-line string.
        """
        lines = []
        lines.append("=" * 50)
        lines.append("  ICD-10 CM -> ZA MAPPING REPORT")
        lines.append("=" * 50)
        lines.append(f"  Total codes     : {stats['total']}")
        lines.append(f"  Exact matches   : {stats['exact']}")
        lines.append(f"  Prefix matches  : {stats['prefix_match']}")
        lines.append(f"  Unmapped        : {stats['unmapped']}")
        lines.append(f"  Success rate    : {stats['success_rate']:.1%}")

        if stats.get("details"):
            lines.append("")
            lines.append(f"  {'CM Code':<12s} {'ZA Code':<12s} {'Type':<15s}")
            lines.append("  " + "-" * 39)
            for cm_code, detail in sorted(stats["details"].items()):
                lines.append(
                    f"  {cm_code:<12s} {detail['za_code']:<12s} {detail['mapping_type']:<15s}"
                )

        lines.append("=" * 50)
        return "\n".join(lines)


# ---------------------------------------------------------------------------
# Module-level convenience functions
# ---------------------------------------------------------------------------

_default_mapper: Optional[ICD10CmZaMapper] = None


def _get_mapper() -> ICD10CmZaMapper:
    """Get or create the default mapper singleton."""
    global _default_mapper
    if _default_mapper is None:
        _default_mapper = ICD10CmZaMapper()
    return _default_mapper


def map_cm_to_za(cm_code: str) -> tuple[str, str]:
    """Map a single CM code to ZA. See ICD10CmZaMapper.map_cm_to_za()."""
    return _get_mapper().map_cm_to_za(cm_code)


def map_code_set(cm_codes: set[str]) -> tuple[set[str], dict]:
    """Map a set of CM codes to ZA. See ICD10CmZaMapper.map_code_set()."""
    return _get_mapper().map_code_set(cm_codes)
