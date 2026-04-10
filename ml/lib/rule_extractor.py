#!/usr/bin/env python3
"""
Rule Extractor — Parses TypeScript source files to extract coding rules.

The TS files (code-pairs.ts, coder-skills.ts) are the single source of truth
for ICD-10 mutual exclusion rules. This module extracts them programmatically
so the benchmark generator can create test cases for every rule.
"""

import re
from pathlib import Path
from typing import Optional

# Default path to the code-pairs.ts file
DEFAULT_CODE_PAIRS_PATH = "/Users/hga/visiocode/lib/engine/code-pairs.ts"


def extract_code_pairs(ts_path: str = DEFAULT_CODE_PAIRS_PATH) -> list[dict]:
    """Parse the ICD10_EXCLUSIONS array from code-pairs.ts.

    Reads the TypeScript source and regex-parses each rule object to extract:
      code1, code2, type, reason, source, category

    Handles multiline entries and various quoting styles.

    Args:
        ts_path: Path to code-pairs.ts

    Returns:
        List of dicts with keys: code1, code2, type, reason, source, category
    """
    path = Path(ts_path)
    if not path.exists():
        raise FileNotFoundError(f"code-pairs.ts not found at {ts_path}")

    content = path.read_text(encoding="utf-8")

    # Pattern to match each object in the array.
    # We match opening { to closing }, allowing multiline content.
    object_pattern = re.compile(
        r'\{\s*'
        r'code1:\s*"([^"]+)"\s*,\s*'
        r'code2:\s*"([^"]+)"\s*,\s*'
        r'type:\s*"([^"]+)"\s*,\s*'
        r'reason:\s*"((?:[^"\\]|\\.)*)"\s*,\s*'
        r'source:\s*"((?:[^"\\]|\\.)*)"\s*'
        r'(?:,\s*category:\s*"([^"]*)")?\s*'
        r',?\s*\}',
        re.DOTALL,
    )

    rules = []
    for match in object_pattern.finditer(content):
        rules.append({
            "code1": match.group(1),
            "code2": match.group(2),
            "type": match.group(3),
            "reason": match.group(4).replace('\\"', '"').replace("\\n", " "),
            "source": match.group(5).replace('\\"', '"'),
            "category": match.group(6) or "icd10_exclusion",
        })

    return rules


# ICD-10 chapter mapping: prefix letter range -> (chapter_number, chapter_name)
_CHAPTER_RANGES = [
    ("A00", "B99", 1, "Certain infectious and parasitic diseases"),
    ("C00", "D48", 2, "Neoplasms"),
    ("D50", "D89", 3, "Diseases of the blood and blood-forming organs"),
    ("E00", "E90", 4, "Endocrine, nutritional and metabolic diseases"),
    ("F00", "F99", 5, "Mental and behavioural disorders"),
    ("G00", "G99", 6, "Diseases of the nervous system"),
    ("H00", "H59", 7, "Diseases of the eye and adnexa"),
    ("H60", "H95", 8, "Diseases of the ear and mastoid process"),
    ("I00", "I99", 9, "Diseases of the circulatory system"),
    ("J00", "J99", 10, "Diseases of the respiratory system"),
    ("K00", "K93", 11, "Diseases of the digestive system"),
    ("L00", "L99", 12, "Diseases of the skin and subcutaneous tissue"),
    ("M00", "M99", 13, "Diseases of the musculoskeletal system"),
    ("N00", "N99", 14, "Diseases of the genitourinary system"),
    ("O00", "O99", 15, "Pregnancy, childbirth and the puerperium"),
    ("P00", "P96", 16, "Certain conditions originating in the perinatal period"),
    ("Q00", "Q99", 17, "Congenital malformations"),
    ("R00", "R99", 18, "Symptoms, signs and abnormal clinical findings"),
    ("S00", "T98", 19, "Injury, poisoning and external causes"),
    ("V01", "Y98", 20, "External causes of morbidity and mortality"),
    ("Z00", "Z99", 21, "Factors influencing health status"),
]


def _code_key(code: str) -> tuple[str, int]:
    """Convert a 3-char ICD-10 prefix (e.g. 'A00') to (letter, number) for comparison."""
    letter = code[0].upper()
    try:
        num = int(code[1:3])
    except (ValueError, IndexError):
        num = 0
    return (letter, num)


def extract_chapter_mapping() -> dict[str, tuple[int, str]]:
    """Map ICD-10 code prefix ranges to chapter numbers and names.

    Returns:
        Dict mapping 3-char prefix (e.g. 'A00') to (chapter_number, chapter_name).
        Contains an entry for every possible 3-char code from A00 to Z99.
    """
    mapping = {}

    for start, end, chapter_no, chapter_name in _CHAPTER_RANGES:
        s_letter, s_num = _code_key(start)
        e_letter, e_num = _code_key(end)

        # Iterate through the letter range
        for letter_ord in range(ord(s_letter), ord(e_letter) + 1):
            letter = chr(letter_ord)
            lo = s_num if letter == s_letter else 0
            hi = e_num if letter == e_letter else 99

            for num in range(lo, hi + 1):
                prefix = f"{letter}{num:02d}"
                mapping[prefix] = (chapter_no, chapter_name)

    return mapping


def get_chapter_for_code(code: str, chapter_map: Optional[dict] = None) -> tuple[int, str]:
    """Get the chapter number and name for a given ICD-10 code.

    Args:
        code: ICD-10 code (e.g. 'E11.9', 'S72', 'A00.0')
        chapter_map: Pre-computed chapter mapping (optional, computed if None)

    Returns:
        Tuple of (chapter_number, chapter_name), or (0, "Unknown") if not found.
    """
    if chapter_map is None:
        chapter_map = extract_chapter_mapping()

    # Extract the 3-char prefix
    clean = code.upper().replace(".", "")
    prefix = clean[:3] if len(clean) >= 3 else clean

    return chapter_map.get(prefix, (0, "Unknown"))


if __name__ == "__main__":
    # Quick self-test
    rules = extract_code_pairs()
    print(f"Extracted {len(rules)} code pair rules")
    if rules:
        print(f"  First: {rules[0]['code1']} / {rules[0]['code2']} ({rules[0]['type']})")
        print(f"  Last:  {rules[-1]['code1']} / {rules[-1]['code2']} ({rules[-1]['type']})")

    chapters = extract_chapter_mapping()
    print(f"\nChapter mapping: {len(chapters)} prefixes")
    print(f"  E11 -> {get_chapter_for_code('E11.9', chapters)}")
    print(f"  S72 -> {get_chapter_for_code('S72.0', chapters)}")
    print(f"  O80 -> {get_chapter_for_code('O80', chapters)}")
