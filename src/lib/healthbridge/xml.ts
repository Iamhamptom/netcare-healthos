// XML builder/parser for SA healthcare switching protocol
// Healthbridge uses proprietary XML-based claim format

import type { ClaimSubmission, ClaimResponse, ClaimLineItem } from "./types";
import { safeParseClaimResponse } from "./xml-parser";

/** Build XML claim document for Healthbridge switch submission */
export function buildClaimXML(claim: ClaimSubmission): string {
  const lines = claim.lineItems
    .map((item, i) => buildLineItemXML(item, i + 1))
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<ClaimSubmission xmlns="urn:healthbridge:claims:v2">
  <Header>
    <TransactionType>CLAIM</TransactionType>
    <Timestamp>${new Date().toISOString()}</Timestamp>
    <PracticeNumber>${escapeXml(claim.bhfNumber)}</PracticeNumber>
    <ProviderNumber>${escapeXml(claim.providerNumber)}</ProviderNumber>
    <SoftwareVendor>NetcareHealthOS</SoftwareVendor>
    <SoftwareVersion>1.0.0</SoftwareVersion>
  </Header>
  <Provider>
    <TreatingProvider>${escapeXml(claim.treatingProvider)}</TreatingProvider>
    <PracticeNumber>${escapeXml(claim.bhfNumber)}</PracticeNumber>
    ${claim.referringProvider ? `<ReferringProvider>${escapeXml(claim.referringProvider)}</ReferringProvider>` : ""}
    ${claim.referringBhf ? `<ReferringPracticeNumber>${escapeXml(claim.referringBhf)}</ReferringPracticeNumber>` : ""}
  </Provider>
  <Patient>
    <Name>${escapeXml(claim.patientName)}</Name>
    <DateOfBirth>${claim.patientDob}</DateOfBirth>
    <IDNumber>${escapeXml(claim.patientIdNumber)}</IDNumber>
    <Scheme>${escapeXml(claim.medicalAidScheme)}</Scheme>
    <MembershipNumber>${escapeXml(claim.membershipNumber)}</MembershipNumber>
    <DependentCode>${escapeXml(claim.dependentCode)}</DependentCode>
  </Patient>
  <Claim>
    <DateOfService>${claim.dateOfService}</DateOfService>
    <PlaceOfService>${escapeXml(claim.placeOfService)}</PlaceOfService>
    ${claim.authorizationNumber ? `<AuthorizationNumber>${escapeXml(claim.authorizationNumber)}</AuthorizationNumber>` : ""}
    <LineItems>
${lines}
    </LineItems>
  </Claim>
</ClaimSubmission>`;
}

function buildLineItemXML(item: ClaimLineItem, lineNumber: number): string {
  return `      <LineItem number="${lineNumber}">
        <ICD10Code>${escapeXml(item.icd10Code)}</ICD10Code>
        <CPTCode>${escapeXml(item.cptCode)}</CPTCode>
        ${item.nappiCode ? `<NAPPICode>${escapeXml(item.nappiCode)}</NAPPICode>` : ""}
        <Description>${escapeXml(item.description)}</Description>
        <Quantity>${item.quantity}</Quantity>
        <Amount>${item.amount}</Amount>
        ${item.modifiers?.length ? `<Modifiers>${item.modifiers.map((m) => `<Modifier>${escapeXml(m)}</Modifier>`).join("")}</Modifiers>` : ""}
      </LineItem>`;
}

/** Build XML for eligibility/benefit check */
export function buildEligibilityXML(data: {
  bhfNumber: string;
  membershipNumber: string;
  dependentCode: string;
  patientDob: string;
  scheme: string;
}): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<EligibilityCheck xmlns="urn:healthbridge:eligibility:v2">
  <Header>
    <TransactionType>ELIGIBILITY</TransactionType>
    <Timestamp>${new Date().toISOString()}</Timestamp>
    <PracticeNumber>${escapeXml(data.bhfNumber)}</PracticeNumber>
  </Header>
  <Query>
    <Scheme>${escapeXml(data.scheme)}</Scheme>
    <MembershipNumber>${escapeXml(data.membershipNumber)}</MembershipNumber>
    <DependentCode>${escapeXml(data.dependentCode)}</DependentCode>
    <DateOfBirth>${data.patientDob}</DateOfBirth>
  </Query>
</EligibilityCheck>`;
}

/** Build XML for claim reversal */
export function buildReversalXML(data: {
  bhfNumber: string;
  originalTransactionRef: string;
  reason: string;
}): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<ClaimReversal xmlns="urn:healthbridge:claims:v2">
  <Header>
    <TransactionType>REVERSAL</TransactionType>
    <Timestamp>${new Date().toISOString()}</Timestamp>
    <PracticeNumber>${escapeXml(data.bhfNumber)}</PracticeNumber>
  </Header>
  <Reversal>
    <OriginalTransactionRef>${escapeXml(data.originalTransactionRef)}</OriginalTransactionRef>
    <Reason>${escapeXml(data.reason)}</Reason>
  </Reversal>
</ClaimReversal>`;
}

/** Parse a claim response XML — delegates to safe XML parser with XXE prevention */
export function parseClaimResponseXML(xml: string): ClaimResponse {
  return safeParseClaimResponse(xml);
}

/** Extract text content of an XML tag */
function extractTag(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`));
  return match ? match[1].trim() : null;
}

/** Escape special XML characters */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
