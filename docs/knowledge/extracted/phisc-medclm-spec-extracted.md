# PHISC MEDCLM Specification

Extracted from PDF. All 51 pages included.


--- Page 1 ---

 
1 
 
 
 
 
 
 
PHISC MESSAGE STANDARDS SUBCOMMITTEE: 
 
 
 
 
 
SOUTH AFRICAN ST ANDARD MESSAGE 
MEDCLM 
MEDICAL AID CLAIMS MESSAGE 
 
 
 
 
 
 
 
      Message Type  : MEDCLM 
      Version   : 0 
      Release   : 912 
      Contr. Agency  : ZA 
      Revision number  : 13.4 
      Status   : 0 
      Date   : 2016-11 
 
 
 
 
 
PHISC DISCLAIMER 
 
The information contained in this document has been developed and compiled by PHISC participants and is 
accordingly copyrighted to PHISC. Any unauthorised dissemination of the information is strictly prohibited.  The 
information may not be used without written permission and without acknowledgement to PHISC and may not be 
sold or used for similar commercial purposes, unless a licensing fee is agreed to by PHISC. 
All reasonable precautions have been taken by PHISC to verify the information contained in this material.  
However, published material is being distributed without warranty of any kind, either expressed or implied.  The 
responsibility for the interpretation and use of the material lies with the reader/user.  In no event shall PHISC 
be liable for damages or consequences arising from its use. 
The information does not constitute law, a nd/or an interpretation of the law or legal position and should also 
not be read or construed as such.  Readers are advised to seek legal opinion to verify any document, guidance or 
information provided by PHISC.  PHISC opinions, its documents  and the inf ormation contained therein only 
constitute views, guidelines and opinions, and are not binding upon any person or entity. 
The above disclaimer will also extend to PHISC participants and their organisations.  Accordingly, such persons 
will not be liable in any way for any consequence that may flow from this document, its use or the participation 
of any person in PHISC drafting, processes, discussions and/or approvals. 
 

--- Page 2 ---

 
2 
 
CONTENTS 
 
 
 
0 Introduction 
 
1 Scope 
 
 1.1 Functional Definition 
 1.2 Field of Application 
 1.3 Principles 
 
2 References 
 
3 Terms and Definitions 
 
4 Message Definition 
 
 4.1 Data Segment Clarification 
  4.1.1 Heading Section 
  4.1.2 Detail Section 
  4.1.3 Summary Section 
 
 4.2 Message Structure 
  4.2.1 Segment Table 
  4.2.2 Branching Diagram 
 
 4.3 Data Segments (Alphabetic Sequence) 
 

--- Page 3 ---

 
3 
0 Introduction 
 
This specification provides the definition of the Medical Claims Message (MEDCLM) to be used in 
Electronic Data Interchange (EDI) between trading partners involved in medical claims administration 
according to UN/EDIFACT standards. 
 
1 Scope 
 
1.1 Functional Definition 
 
A message specifying details of medical goods, services, and medicines received from suppliers as 
agreed between trading partners. 
 
1.2 Field of Application 
 
The medical claims message (MEDCLM) may be used nationally for claims of medical goods, services 
and medicines rendered. 
 
1.3 Principles 
 
A supplier may claim for one or more medical goods, services or medicines. A single medical claims 
message may refer to numerous medical goods, services or medicines per patient, indicating one or 
more service dates when these medical goods, services or medicines were rendered. 
 
2 References 
 
Representative Association of Medical Schemes (RAMS) 
See UNTDID, Part 4, Section 2.5, UN/ECE UNSM - General Introduction, Section 1. 
 
3 Terms and Definitions 
 
The medical supplier may be a medical practitioner, a hospital, a pharmacy or supplier of medical 
goods, services or medicines. The medical aid may be a medical aid scheme, medical insurer or medical 
administrator.  It is the party settling an account on behalf of patients. The message may only contain 
one claim. See UNTDID, Part 4, Section 2.5, UN/ECE UNSM - General Introduction, Section 2. 
 
3.1 DATA FORMATS 
 
All numeric fields must be “USAGE DISPLAY” 
All negative numeric fields must be LEADING SIGNED 
All numeric fields which carry amounts or monetary values have two implied decimal places. There are 
no embedded points or commas. 
All numeric fields must be right-justified, and not zero filled. 
VAT is all inclusive. 
 

--- Page 4 ---

 
4 
4 Message Definition 
 
4.1 Data Segment Clarification 
 
This section should be read in conjunction with the Branching Diagram and the Segment Table which 
indicate mandatory, conditional and repeating requirements. 
 
4.1.1 Heading Section 
 
Information to be provided in the Heading Section: 
 
UNH MESSAGE HEADER 
 
Mandatory Occurrence 1 
 
A  service  segment  to  identify  the  message  type,  version  and  release,  and  a  unique  reference  
number 
 
Function: To  head,  identify  and  specify  a  message. 
 
0062 MESSAGE REFERENCE NUMBER M an..14 Unique reference number which 
will be the same in the UNT 
     
S009 MESSAGE IDENTIFIER M   
0065 Message type identifier M an..6 MEDCLM 
0052 Message type version number M an..3 0 
0054 Message type release number M an..3 912 
0051 Controlling agency M an..2 ZA 
0057 Association assigned code C an..6 013 
     
0068 COMMON ACCESS REFERENCE C an..35  
     
S010 STATUS OF THE TRANSFER C an..35  
0070 Sequence message transfer number M n..2  
0073 First/last sequence message transfer 
indication 
C a1  
 
Example: UNH+0001782+MEDCLM:0:912:ZA’ 
 
Notes: 
 
UNH - A service segment to identify the message type, version, release and unique reference 
number.(Translator should do all this) 
Element Qualifier Data required Mandatory / Optional Supplier 
0062  Interchange number Mandatory All 
0065  MEDCLM Mandatory All 
0052  0 Mandatory All 
0054  912 Mandatory All 
0051  ZA Mandatory All 
0057  Revision number 
(version number) of 
message, ie. 013 
Optional All 
0070  Message number Optional All 
0073  F or L Optional All 
 
 

--- Page 5 ---

 
5 
 
BGM BEGINNING  OF  MESSAGE 
 
Conditional  Occurrence 1 
 
Function: To identify the date / number of which this transmission was created. 
 
 
C002 DOCUMENT/MESSAGE NAME C  NOT USED 
1001 Document/message name, coded C an..3  
1131 Code list qualifier C an..3  
3055 Code list responsible agency, coded C an..3  
     
1000 DOCUMENT/MESSAGE NAME C an..35 NOT USED 
     
1004 DOCUMENT/MESSAGE NUMBER C an..35 NOT USED 
     
C507 DATE/TIME/PERIOD C   
2005 Date/time/period qualifier M an..3 97 = transaction creation date 
2380 Date/time/period M an..35 Data for qualifier(s) in element 
2005 
2379 Date/time/period format qualifier M an..3 102 = CCYYMMDD 
     
1225 MESSAGE FUNCTION, CODED C an..3 NOT USED 
     
C506 REFERENCE C   
1153 Reference qualifier M an..3 BAT = batch number 
1154 Reference number C an..35 Data for qualifier(s) in element 
1153  
(Usage is 18 digits zero filled) 
1156 Line number C an..6  
     
C507 DATE/TIME/PERIOD C  NOT USED 
2005 Date/time/period qualifier M an..3  
2380 Date/time/period M an..35  
2379 Date/time/period format qualifier M an..3  
     
4343 RESPONSE TYPE, CODED C an..3 NOT USED 
     
 
Example: BGM+++97:19941001:102++BAT:000000000000000001’  
 
Notes: 
 
BGM - To identify the date / number of which this transmission was created. 
Element Qualifer Data required Mandatory / Optional Supplier 
2005 97 Actual date for which 
this interchange was 
created 
Mandatory All 
1153 BAT Sequential number per 
Trading Partner, 
numeric 18 characters, 
zero filled 
Mandatory All 
 
 
 
 

--- Page 6 ---

 
6 
 
DCR DOCUMENTARY REQUIREMENT 
 
Conditional  Occurrence 9 
 
Function: To identify documentary requirements and claim corrections. 
 
C185 DOCUMENTARY REQUIREMENT C   
1001 Document/message name, coded M an..3 Y = document will be forwarded 
1131 Code list qualifier C an..3  
3055 Code list responsible agency, coded C an..3  
1243 Missing document indicator, coded C an..3  
     
C506 REFERENCE C   
1153 Reference qualifier M an..3 ADJ = amendment to previous 
claim or line 
ADD = additions to previous 
account 
DOC = reference number of 
document  
INT = interim account 
REV = reversal of previous claim 
or line 
RSV = resubmitted claim 
SBN = Supplier Batch Number 
1154 Reference number C an..35 Data for qualifier(s) in element 
1154 
1156 Line number C an..6  
     
C507 DATE/TIME/PERIOD C  NOT USED 
2005 Date/time/period qualifier M an..3  
2380 Date/time/period M an..35  
2379 Date/time/period format qualifier M an..3  
     
C517 LOCATION IDENTIFICATION C  NOT USED 
3227 Place/location qualifier M an..3  
3225 Place/location identification C an..25  
1131 Code list qualifier C C  
3055 Code list responsible agency, coded C an..3  
3224 Place/location C an..17  
3439 Sub-location identification C an..17  
1131 Code list qualifier C an..3  
3055 Code list responsible agency, coded C an..3  
3438 Sub-location C an..17  
 
Example: DCR++ADJ:3443443’ 
 
Notes: 
 
DCR - To identify documentary requirements and claim corrections 
Element Qualifier Data required Mandatory / Optional Supplier 
1001  Y Optional All 
1153 ADJ Original claim number Mandatory if ADJ is 
used 
All 
 ADD Original claim number Mandatory if ADD is 
used 
All 
 DOC Reference Number of 
Document (see 1001) 
Mandatory if DOC is 
used 
All 

--- Page 7 ---

 
7 
 INT Y or N Mandatory if INT is 
used 
Hospitals 
 REV Original claim number Mandatory if REV is 
used 
All 
 RSV   All 
 SBN Original Supplier Batch 
Number 
Use if Batch Number 
on BGM not the same 
as issued by Original 
Supplier 
All 

--- Page 8 ---

 
8 
 
DTM DATE/TIME/PERIOD 
 
Conditional  Occurrence 9 
 
Function: To indicate the admission/discharge/interim and accident dates and times. 
 
C507 DATE/TIME/PERIOD M   
2005 Date/time/period qualifier M an..3 96 = discharge date/time 
155 = accounting period start 
date/time 
156 = accounting period end 
date/time 
194 = admit start date/time 
290 = date of accident (IOD) 
2380 Date/time/period M an..35 Data for qualifier(s) in element 
2005 
2379 Date/time/period format qualifier M an..3 102 = CCYYMMDD format 
203 = CCYYMMDDHHMM 
format 
 
Example: DTM+194:199410011519:203’ 
 
Notes: 
 
DTM - To indicate admission/discharge/interim dates and times 
Element Qualifier Data required Mandatory / Optional Supplier 
2005 96 Actual date/time of 
discharge 
Optional Hospitals 
 155 Actual accounting 
period start date 
(interim accounts) 
Optional Hospitals 
 156 Actual accounting 
period end date (interim 
accounts) 
Optional Hospitals 
 194 Actual date/time of 
admission 
Optional Hospitals 
 290 Date of IOD accident Optional WCA claims 
 

--- Page 9 ---

 
9 
 
 Segment Group 1 NAD-RFF-FTX 
 
 A group of segments used to identify various names and addresses for the entire message,  and 
their associated references where applicable. 
 
NAD NAME AND ADDRESS 
 
Mandatory  Occurrence  1 
 
Function: Used for various names and addresses for the entire message. 
 
3035 PARTY QUALIFIER M an..3 ADN = admitting doctor. 
EMR = name of employer. 
GRP = for group practice RAMS 
number 
HMO = health medical officer. 
LTN = laboratory technician. 
MAN = medical administrators 
number. 
MIN = members initials. 
MN = members surname. 
MPN = medical plan number. 
MSN = membership number. 
PPO = preferred provider. 
RDN = referred by doctor. 
REG = registration number of the 
doctor(SAMDC). 
RTN = referred to doctor 
SCH = members scheme number. 
SUP = supplier number. 
TDN = treating doctor. 
 
     
C082 PARTY IDENTIFICATION DETAILS C   
3039 Party id identification M an..17 Data for qualifier(s) in element 
3035 except for qualifer MN, MIN 
1131 Code list qualifier C an..3  
3055 Code list responsible agency, coded C an..3  
     
C058 NAME AND ADDRESS C   
3124 Name and address line M an..35 Supplier/Member Address 
3124 Name and address line C an..35 Supplier/Member Address 
3124 Name and address line C an..35 Supplier/Member Address 
3124 Name and address line C an..35 Supplier/Member Address 
3124 Name and address line C an..35 Supplier/Member Address 
     
C080 PARTY NAME C   
3036 Party name M an..35 Supplier/Member details 
3036 Party name C an..35  
3036 Party name C an..35  
     
C059 STREET C  NOT USED 
3042 Street and number/P.O. Box M an..35  
3042 Street and number/P.O. Box C an..35  
3042 Street and number/P.O. Box C an..35  
     
3164 CITY NAME C an..35 NOT USED 
     

--- Page 10 ---

 
10 
3229 COUNTRY SUB-ENTITY 
IDENTIFICATION 
C an..9 NOT USED 
     
3251 POSTCODE IDENTIFICATION C an..9 NOT USED 
     
3207 COUNTRY, CODED C an..3 NOT USED 
 
Example: NAD+SUP+5801982’ 
 
Notes: 
 
NAD - Number / name of supplier, member, referring/admitting/treating doctor and technician and medical 
plan number 
Element Qualifer Data required Mandatory / Optional Supplier 
3035 ADN Admitting doctor Rams 
number 
Optional Hospitals 
 EMR Employer name Optional WCA claims 
 GRP Group practice RAMS 
number 
Mandatory if Pr 50/51 Group practices 
 HMO Health Medical Officer 
number 
Optional HMO 
 LTN Laboratory Technician 
Rams number 
Optional Laboratory Technician 
 MAN Medical Administrator's 
number 
Optional All 
 MIN Member's initials Optional All 
 MN Member's surname Optional All 
 MPN Member's medical plan Optional All 
 MSN Membership number Mandatory All 
 PPO Preferred Provider 
number 
Optional PPO 
 RDN Referred by doctor’s 
Rams number 
Optional Specialists and 
Hospitals 
 REG Registration number of 
doctor other than his 
Rams number 
Optional All 
 RTN Referred to Doctor’s 
number 
Optional All 
 SCH Member's scheme 
number and name 
Optional All 
 SUP Supplier Rams number 
and name 
Mandatory if notPr 
50/51 
All 
 TDN Treating doctor Optional Hospitals 
3124  Supplier's name and 
address 
Optional All 
3036 MIN Member’s name Optional All 
3036  Suppliers name Optional All 
 
 
 
 
 
 
 

--- Page 11 ---

 
11 
 
RFF REFERENCE 
 
Conditional  Occurrence 99 
 
Function: References associated only with preceding NAD 
 
C506 REFERENCE M   
1153 Reference qualifier M M ACD = additional reference 
number. 
ADE = patient account number. 
AE = authorisation for expense. 
ALS = Advanced life support. 
BLS = Basic life support. 
CAF = Benefit Type (previously 
acute/chronic flag. 
CL = for code list 
CMP = for complaint codes. 
CPT = Current Proced: Term: code 
CYN = Contract Y/N 
DAG = for diagnosis codes. 
DS = discharge status. 
EDC = for electronic data card. 
EI = employee identification 
number. 
FFT = for fixed fee account. 
ICD = ICD-10 diagnosis code 
ICA = ICD-10 admission diagnosis 
code 
ICX = ICD-10 discharge diagnosis 
code 
IOD = for injured on duty (for 
supplier). 
LOF = for location code from. 
LOT = for location code to. 
MAT = for maternity. 
MVA = for third party claims. 
OUT = for out-patients. 
POS = Place Of Service code 
PRE = for prescription number. 
PRO = for procedure codes. 
RCT = for receipt claims. 
SOB = for scale of benefit 
indicator. 
SRF = for supplier reference 
number. 
WCA = for workman's 
compensation indicator. 
WCN = for case number 
 
1154 Reference number C an..35 Data for qualifier(s) in element 
1153 
1156 Line number C an..6 Line number 
     
C507 DATE/TIME/PERIOD C  NOT USED 
2005 Date/time/period qualifier M an..3  
2380 Date/time/period M an..35  
2379 Date/time/period format qualifier M an..3  
  M   

--- Page 12 ---

 
12 
 
Example: RFF+ADE:112211’ 
 
 
 
 
Notes: 
 
RFF - A segment to identify various references associated with the corresponding NAD 
Element Qualifier Data required Mandatory / Optional Supplier 
1153 ACD Additional reference 
number 
Optional All 
 ADE Patient account number Mandatory All 
 AE Authorisation for 
expense number 
Optional All 
 ALS Advanced life support Optional Ambulances 
 BLS Basic life support Optional Ambulances 
 CAF 0 = acute 
1 = chronic 
2 = PAT 
3 = chemo 
Optional Pharmacy/Doctor 
 CL Code List Optional All 
 CMP Complaint code Optional Hospitals 
 CPT CPT Code/s 
separated by  / 
Optional All 
 CYN Service Provider in(Y) 
or out(N) of 
Contract/Network 
Optional All 
 DAG Diagnosis code Optional Hospitals 
 DS Discharge status 
indicator 
Optional Hospitals 
Ambulances 
 EDC Electronic transaction 
number 
Optional All 
 EI Employee identification 
number 
Optional All 
 FFT Y or N Optional Hospitals 
 ICD ICD10 Code/s 
separated by  / 
Optional All 
 ICA ICD10 Admission 
Code/s 
separated by  / 
Optional Hospitals 
 ICX ICD10 Discharge 
Code/s 
separated by  / 
Optional Hospitals 
 IOD Y or N Mandatory if an IOD 
claim 
All 
 LOF Location code for taken 
from 
Mandatory if 
ambulance account 
Ambulances 
 LOT Location code for taken 
to 
Mandatory if 
ambulance account 
Ambulances 
 MAT Y or N Mandatory if maternity 
claim 
All 
 MVA Y or N Mandatory if for third 
party claim 
All 
 OUT Y or N Mandatory if an out 
patient claim 
Hospitals 

--- Page 13 ---

 
13 
 POS PHISC Place Of 
Service Code 
Optional All 
 PRE Prescription number Mandatory Pharmacy 
 PRO Procedure code Optional Hospitals 
 RCT Y or N Mandatory if claim is 
receipted 
All 
 SOB Y or N Optional All 
 SRF Supplier reference 
number 
Optional Pharmacy 
 WCA Y or N Optional All 
 WCN Case number Optional WCA 

--- Page 14 ---

 
14 
 
FTX FREE TEXT 
 
Conditional  Occurrence 9 
 
Function: Used for free text where codes are not available. 
 
4451 TEXT SUBJECT QUALIFIER M an..3 CMP = description of complaint 
code codes. 
CPT = description of CPT code/s 
DAG = description of diagnosis 
codes. 
DS = Discharge status. 
ICD = description of ICD10 code/s 
LOF = description of location 
from. 
LOT = description of location to. 
PRO = description of procedure 
codes. 
 
     
4453 TEXT FUNCTION, CODED C an..3 NOT USED 
     
C107 TEXT REFERENCE C  NOT USED 
4441 Free text, coded M an..3  
1131 Code list qualifier C C  
3055 Code list responsible agency, coded C C  
     
C108 TEXT LITERAL C   
4440 Free text M an..70 Data for qualifier(s) in element 
4451 
4440 Free text C an..70  
4440 Free text C an..70  
4440 Free text C an..70  
4440 Free text C an..70  
     
3453 LANGUAGE, CODED C an..3 NOT USED 
     
 
Example: FTX+DAG+++FLU’ 
 
Notes: 
 
FTX - For free text where codes are not available (per claim). 
Element Qualifier Data required Mandatory / Optional Supplier 
4451 CMP Complaint description Optional All 
 CPT CPT Description/s 
separated by /  
Optional All 
 DAG Diagnosis description Optional All 
 DS Discharge status 
indicator 
Optional Hospitals 
Ambulances 
 ICD ICD10 description/s 
separated by  / 
Optional All 
 LOF Description of the 
location from 
Optional Ambulances 
 LOT Description of the 
location to 
Optional Ambulances 
 PRO Procedure description Optional All 

--- Page 15 ---

 
15 
 
PAT PAYMENT TERMS BASIS 
 
Conditional  Occurrence 99 
 
Function: Used for deposits, intrest, discount or levies on an account for the entire message. 
 
4279 PAYMENT TERMS TYPE 
QUALIFIER 
M an..3 14 = paid against statement (patient 
has paid for the service and should 
be reimbursed / deposit paid to 
hospital) 
20 = penalty terms. 
22 = discount. 
29 = levy on pharmacy 
prescriptions per script. 
30 = professional checking fee. 
31 =  member levy. 
32 = MMAP surcharge. 
33 = for CPO surcharge. 
36 = for call out fee. 
37 = for late fee. 
38 = for professional consultation 
fee. 
39 = for medicine delivery fee 
     
C110 PAYMENT TERMS C  NOT USED 
4277 Terms of payment identification M an..17  
1131 Code list qualifier C an..3  
3055 Code list responsible agency, coded C an..3  
4276 Terms of payment C an..35  
 Terms of payment C an..35  
     
C507 DATE/TIME/PERIOD C   
2005 Date/time/period qualifier M an..3 286 = for service start date/time. 
292 = for dispensing date 
 
2380 Date/time/period M an..35 Data for qualifier(s) in element 
2005 
2379 Date/time/period format qualifier M an..3 102 - CCYYMMDD 
     
C112 TERMS TIME INFORMATION C  NOT USED 
2475 Payment time reference, coded M an..3  
2009 Time relation, coded C an..3  
2151 Time relation, coded C an..3  
2152 Number of periods C n..3  
     
C142 TERMS DISCOUNT/PENALTY C  NOT USED 
5482 Percentage C n..8  
2151 2151 C an..3  
5004 Monetary amount C n..18  
     
     
     
     
     
     
     
     
     

--- Page 16 ---

 
16 
     
     
C516 MONETARY AMOUNT C   
5025 Monetary amount type qualifier M an..3 48 = for deposit amount. 
52 = for discount amount. 
202 = for interest amount charged. 
205 = for levy amount. 
206 = for additional surcharge. 
208 = for call out fee amount. 
209 = for late fee amount. 
212 = for MMAP surcharge 
amount. 
213 = for member levy amount. 
214 = for CPO discount  amount. 
216 = for pharmacy checking fee 
amount. 
217 = for professional consultation 
fee amount. 
218 = for medicine delivery fee 
amount 
219 = paid by patient. 
5004 Monetary amount C n..18  
6345 Currency, coded C an..3  
6343 Currency qualifier C an..3  
4405 Status, coded C an..3  
     
C501 PERCENTAGE DETAILS C   
5245 Percentage qualifier M an..3 7 = for percentage (deposit). 
12 = for percentage (discount). 
16 = for percentage (interest). 
17 = for percentage (levy). 
 
5482 Percentage M n..8 Data for qualifier(s) in element 
5245 
5249 Percentage basis qualifier C an..3  
     
 
Example: PAT+14+++++48’ 
 
 

--- Page 17 ---

 
17 
 
Notes: 
 
PAT - A segment to indicate a deposit amount, interest chargeable or a discount amount or levy paid on 
a prescription for the message (per claim). 
Element Qualifier Explanatory Notes Mandatory / Optional Supplier 
4279 14 To indicate that there 
was a payment against 
the claim 
Optional All 
 20 To indicate that this is 
for a penalty 
Optional All 
 22 To indicate that this is a 
discount 
Optional All 
 29 To indicate the levy 
charged against a script 
Optional All 
 30 Professional checking 
fee 
Optional Pharmacy 
 31 Member levy Optional Pharmacy 
 32 MMAP surcharge Optional Pharmacy 
 33 CPO surcharge Optional Pharmacy 
 36 Call out fee Optional Pharmacy 
 37 Late fee Optional Pharmacy 
 38 Professional 
consultation fee 
Optional Pharmacy 
5025 48 Actual deposit amount Optional All 
 52 Actual discount amount Optional All 
 202 Actual interested 
amount charged 
Optional All 
 205 Actual levy amount Optional All 
 206 Additional surcharge 
amount 
Optional Pharmacy 
 208 Call out fee amount Optional Pharmacy 
 209 Late fee amount Optional Pharmacy 
 212 MMAP surcharge 
amount 
Optional Pharmacy 
 213 Member levy amount Optional Pharmacy 
 214 CPO discount amount Optional Pharmacy 
 216 Pharmacy checking fee 
amount 
Optional Pharmacy 
 217 Professional 
consultation fee amount 
Optional Pharmacy 
 218 Medicine Delivery Fee 
amount 
Optional Pharmacy 
5245 7 Deposit percentage  Optional All 
 12 Discount percentage Optional All 
 16 Interest percentage  Optional All 
 17 Levy Percentage Optional All 
2005 286 Actual date ( this 
applies to claims if the 
service date and the 
discount date differ) 
Optional All 
 292 Dispensing date Optional Pharmacy 
 
 
 
 
 

--- Page 18 ---

 
18 
 
TAX DUTY/TAX/FEE DETAILS 
 
Conditional  Occurrence 9 
 
Function: Used for Tax purposes for the entire message. 
 
5283 DUTY/TAX/FEE FUNCTION 
QUALIFIER 
M an..3 7 = for contribution levied by 
authority (VAT) 
10 = for pharmacy sales tax / vat 
     
C516 MONETARY AMOUNT C  NOT USED 
5025 Monetary amount type qualifier M an..3  
5004 Monetary amount C n..18  
6345 Currency, coded C an..3  
6343 Currency qualifier C an..3  
4405 Status, coded C an..3  
     
C241 DUTY/TAX/FEE TYPE C  NOT USED 
5153 Duty/tax/fee type, coded C an..3  
1131 Code list qualifier C an..3  
3055 Code list responsible agency, coded C an..3  
5125 Duty/tax/fee type C an..35  
     
C533 DUTY/TAX/FEE ACCOUNT DETAIL C  NOT USED 
5289 Duty/tax/fee account identification M an..6  
1131 Code list qualifier C an..3  
3055 Code list responsible agency, coded C an..3  
     
5286 DUTY/TAX/FEE ASSESSMENT 
BASIS 
C an..15  
     
C243 DUTY/TAX/FEE DETAIL C   
5279 Duty/tax/fee rate identification C an..7 135 = to identify specific rate. 
1131 Code list qualifier C an..3  
3055 Code list responsible agency, coded C an..3  
5278 Duty/tax/fee rate C an..17 Data for qualifier(s) in element 
5279 
5273 Duty/tax/fee rate basis identification C an..12  
1131 Code list qualifier C an..3  
3055 Code list responsible agency, coded C an..3  
     
C529 PROCESSING INDICATOR C  NOT USED 
7365 Processing indicator, coded M an..3  
1131 Code list qualifier C an..3  
3055 Code list responsible agency, coded C an..3  
     
C516 MONETARY AMOUNT C  NOT USED 
5025 Monetary amount type qualifier M an..3  
5004 Monetary amount C n..18  
6345 Currency, coded C an..3  
6343 Currency qualifier C an..3  
4405 Status, coded C an..3  
     
5305 DUTY/TAX/FEE CATEGORY, 
CODED 
C an..3 NOT USED 
     
3446 PARTY TAX IDENTIFICATION 
NUMBER 
C an..20 NOT USED 

--- Page 19 ---

 
19 
     
 
Example: TAX+7+++++135:::1400’ 
 
Notes: 
 
TAX- A segment that indicates the default rate of VAT (per claim). 
Element Qualifier Explanatory Notes Mandatory / Optional Supplier 
5283 7 Contribution levied by 
authority 
Optional All 
 10 Pharmacy sales tax / vat Optional Pharmacy 
5279 135 Actual vat rate charged Optional All 
 
 
 
 

--- Page 20 ---

 
20 
 
 
  4.1.2 Detail Section 
 
 Segment Group 2. DTM-RFF-FTX-Grp3 
 
 A group that provides service details, including tariffs, modifiers, and patient information. 
 This group includes groups 3, and 4. 
 
D T M  DATE / TIME / PERIOD 
 
Mandatory  Occurrence 1 
 
Function: To specify the servce date, time, period. 
 
C507 DATE / TIME / PERIOD M   
2005 Date / time / period qualifier M an..3 286 = for service start date/time. 
290 = for date of accident 
292 = for dispensing date 
 
2380 Date / time / period M an..35 Data for qualifier(s) in element 
2005 
2379 Date / time / period format qualifier M an..3 102 = for CCYYMMDD format. 
203 = for CCYYMMDDHHMM 
format. 
     
 
Example: DTM+286:19941001:102’ 
 
Notes: 
 
DTM - Specifies the start service date. 
Element Qualifier Data required Mandatory / Optional Supplier 
2005 286 Actual service date Mandatory All 
 290 Actual date of accident Optional WCA 
 292 Dispensing date Optional Pharmacy 
 
 
 
 

--- Page 21 ---

 
21 
 
R F F  REFERENCE 
 
Conditional Occurrence 99 
 
Function: Specifies all the detail regarding the patient, plus specialist / assistant / anaesthetists 
  number / name and the end of the service date/time. 
 
C506 REFERENCE M   
1153 Reference qualifier M an..3 AE = Authorisation for expense. 
ANT = for anaesthetists. 
ASN = for assistant specialist. 
DPN = for dependant number. 
DS = Discharge status. 
ESD = for end service date/time 
ID = for citizen identifier. 
LAB = for laboratory number. 
LOS = Authorized length of stay 
PHY = for physiotherapy done in 
hospital. 
PIN = for patients initials. 
PSU = for patient surname. 
PTH = for tests done in hospital. 
PTN = for patient name. 
RAD = for radiology done in 
hospital. 
RDN = for referring doctor. 
RDO = for radiology reference 
number. 
REG = for registration number. 
RLN = for relationship. 
SM2 = SNOMED II code 
SM3 = SNOMED III code 
SSN = for specialist. 
SX = for patient sex. 
TDN = for treating doctor. 
TO = for time out of theatre 
 
1154 Reference  number C an..35 Data for qualifier(s) in element 
1153 
1156 Line  number C an..6  
     
C507 DATE / TIME / PERIOD C   
2005 Date / time / period qualifier M an..3 285 = for patient date of birth. 
287 = for date/time service 
stopped. 
 
2380 Date / time / period M an..35 Data for qualifier(s) in element 
2005 
2379 Date / time / period format qualifier M an..3 102 = for CCYYMMDD format. 
203 = for CCYYMMDDHHMM 
format. 
806 = for MMM format. 
 
 
Example: RFF+PTN:MRS M.E. VILJOEN+285:19641001:102’  
 
 
 

--- Page 22 ---

 
22 
 
 
Notes: 
 
RFF - Specifies all the detail regarding the patient, plus specialist / assistant / anaesthetists number / 
name and the end of the service date/time. 
Element Qualifier Data required Mandatory / Optional Supplier 
1153 AE Authorisation for 
expenxe 
Optional All 
 ANT Anaesthetist Rams 
number 
Optional All 
 ASN Specialist assistant 
Rams number 
Optional All 
 DPN Dependent number Optional All 
 DS Discharge status 
indicator 
Optional Hospitals 
Ambulances 
 ESD End service date time Optional All 
 ID ID number Optional All 
 LAB Laboratory number Optional Laboratory Technician 
 LOS Authorized length of 
stay 
Optional Hospitals/MCOs 
 PHY Y or N Optional Physiotherapist 
     
 PIN Patient's initials Optional Pharmacy 
 PSU Patient surname Optional All 
 PTH Y or N Optional Pathologists 
 PTN Patient name Mandatory All 
 RAD Y or N Optional Radiologists 
 RDO Radiology refernce 
number 
Optional Radilogists 
 RDN Referring doctor's Rams 
number 
Optional Not applicable to G.P.'s 
 REG Registration 
number(SAMDC) 
Optional All 
 RLN Relationship to 
principal member : 
Self/Wife/Child 
Optional All 
 SM2 SNOMED II code Optional 
(never with SM3) 
Pathologists 
 SM3 SNOMED III code Optional 
(never with SM2) 
Pathologists 
 SSN Specialist Rams number Optional All 
 SX M or F Optional All 
 TDN Treating doctor(group 
practices) 
Optional All 
 TO Time out of theatre Optional Hospitals 
 XCD Repricing Code Optional MCOs 
2005 285 Patient's date of birth Optional All 
 287 End service date Optional All 
 
 
 

--- Page 23 ---

 
23 
 
FTX FREE  TEXT 
 
Conditional  Occurrence 9 
 
Function: For codes not available 
 
4451 TEXT  SUBJECT,  CODE M an..3 ANT = for description of 
anaesthetists name. 
ASN = for description of specialist 
assistant name. 
DS = Discharge status. 
NTE = Free format notes (may use 
all occurs of 4440) 
RDN = for description of referring 
doctors name. 
SM2 = SNOMED II description 
SM3 = SNOMED III description 
SSN = for description of specialist 
name. 
XCD = Repricing description 
 
     
4453 TEXT  FUNCTION CODED C an..3 NOT USED 
     
C107 TEXT  REFERENCE C  NOT USED 
4441 Free  text,  coded M an..3  
1131 Code  list  qualifier C an..3  
3055 Code list responsible agency coded C an..3  
     
C108 TEXT  LITERAL C   
4440 Free  text M an..70 Data for qualifier(s) in element 
4451 
4440 Free  text C an..70  
4440 Free  text C an..70  
4440 Free  text C an..70  
4440 Free  text C an..70  
     
 
Example: FTX+ANT+++DR VILJOEN’ 
 
Notes: 
 
FTX - For codes not available 
Element Qualifier Data required Mandatory / Optional Supplier 
4451 ANT Anaesthetists name Optional All 
 ASN Specialist assistants 
name 
Optional All 
 DS Discharge status 
indicator 
Optional Hospitals 
Ambulances 
 NTE Free format notes Optional All 
 RDN Referring doctor's name Optional All 
 SM2 SNOMED II 
description 
Optional 
(never with SM3) 
Pathologists 
 SM3 SNOMED III 
description 
Optional 
(never with SM2) 
Pathologists 
 SSN Specialist name Optional All 
 XCD Repricing description Optional All 

--- Page 24 ---

 
24 
 Segment Group 3. LIN-RFF-FTX-PAT-TAX-UNS-Grp4 
 
 A group used to identify tariffs, modifiers, medicines, monetary amounts, discounts and  rates 
of VAT per line. 
 
L I N  LINE  ITEM 
 
Mandatory  Occurrence 1 
 
Function: A line item segment to indicate the tariff details for a particular service. Also used 
  as a sub-line item segment to provide modifying of tariffs for the previous item. A 
  modifier(s) may only appear after the tariff code(s) it is modifying (per tariff item). 
 
1233 RELATIONAL QUALIFIER M an  3 1 = for line item. 
     
1082 LINE  ITEM  NUMBER C n..6 Line number. 
     
1229 ACTION  REQUEST  CODED C an..3 NOT USED 
     
C511 ITEM IDENTIFICATION M   
7139 Item qualifier C an..3 5 = for tariff codes. 
6 = for modifiers. 
7 = for surcharge. 
8 = for non - chargeables. 
9 = for laboratory codes. 
10 = for fixed fee column indicator. 
 
7140 Item number C an..35 Data for qualifier(s) in element 
7139 
1131 Code list qualifier C an..3 (see following Notes) 
3055 Code list responsible agency, coded C an..3  
7143 Item number type, coded C an..3  
1131 Code list qualifier C an..3  
3055 Code list responsible agency, coded C an..3  
     
     
C511 ITEM IDENTIFICATION M   
7139 Item qualifier C an..3  
7140 Item number C an..35  
1131 Code list qualifier C an..3  
3055 Code list responsible agency, coded C an..3  
7143 Item number type, coded C an..3  
1131 Code list qualifier C an..3  
3055 Code list responsible agency, coded C an..3  
     
C186 QUANTITY  DETAILS C  NOT USED 
6063 Quantity qualifier M an..3  
6060 Quantity M n..15  
6411 Measure unit qualifier C an..3  
     
     
     
     
     
     
C509 PRICE  INFORMATION C   

--- Page 25 ---

 
25 
5125 Price qualifier M an..3 ADS = for amount due by scheme. 
CAL = for claimed amount per 
tariff code. 
GP = for gross price. 
NP = for nett price. 
 
5118 Price C n..15 Data for qualifier(s) in element 
5125 
5375 Price type, coded C an..3  
5387 Price type qualifier C an..3  
5284 Unit price basis C n..9  
6411 Measure unit qualifier C an..3  
     
C523 NUMBER  OF  UNIT  DETAILS C   
6350 Number of units C n..15 Data for qualifier(s) in element 
6353 
6353 Number of units qualifier C an..3 DAY = for day. 
HUR = for hour. 
KLM = for kilometres travelled. 
MIN” = for minute. 
SEC = for second. 
UNT = for unit. 
 
     
C516 MONETARY AMOUNT C  NOT USED 
5025 Monetary amount type qualifier M an..3  
5004 Monetary amount C n..18  
6345 Currency coded C an..3  
6343 Currency qualifier C an..3  
4405 Status coded C an..3  
     
C509 PRICE  INFORMATION C  NOT USED 
5125 Price qualifier M an..3  
5118 Price C n..15  
5375 Price  type  coded C an..3  
5387 Price  type  qualifier C an..3  
5284 Unit  price  basis C n..9  
6411 Measure  unit  specifier C an..3  
     
C501 PERCENTAGE DETAILS C  NOT USED 
5245 Percentage qualifier M an..3  
5482 Percentage M n..8  
5249 Percentage basis qualifier C an..3  
     
1222 CONFIGURATION LEVEL C n..2 NOT USED 
     
7083 CONFIGURATION CODED C an..3 NOT USED 
     
5213 SUB - LINE PRICE CHANGE CODED C an..3 NOT USED 
     
 
Example: LIN+1+++5:58001:22+++CAL:447580+1400:DAY’ 
 
 
 
 
 
 
Notes: 

--- Page 26 ---

 
26 
 
LIN - A line item segment to indicate the tariff details for a particular service. Also used as a sub-line 
item segment to provide modifying of tariffs for the previous item. A modifier(s) may only appear after 
the tariff code(s) it is modifying (per tariff item). 
Element Quali
fier 
Data required Mandatory / 
Optional 
Supplier 
1233  1 Mandatory All 
1082  Line number Optional All 
7139 5 Tariff code 
For medicine 
“MEDS” 
Optional All 
 6 Modifier code Optional All 
 7 Surcharge code Optional All 
 8 Non - chargeables 
code 
Optional All 
 9 Laboratory codes Optional All 
 10 Fixed fee code Optional All 
1131 00-10 Unassigned Optional All 
 11 ICD10 Optional All 
 12 ICPC Optional All 
 13-20 Unassigned Optional All 
 21 CPT Optional All 
 22 Tariff Optional All 
 23 CDT Optional All 
 24 Optometry Optional All 
 25-30 Unassigned Optional All 
 31 NAPPI Optional All 
 32-49 Unassigned Optional All 
 99 Unsupported Optional All 
5125 ADS Amount due by 
scheme 
Optional Pharmacy 
 CAL Amount claimed Optional All 
 GP Gross price amount Optional Pharmacy 
 NP Nett price amount Optional Pharmacy 
6353 Day Actual number of 
days 
Optional Hospitals 
 HUR Actual number of 
hours 
Optional All 
 KLM Actual number of 
kilometres 
travelled 
Optional All 
 MIN Actual number of 
minutes 
Optional All 
 SEC Actual number of 
seconds 
Optional All 
 UNT Actual number of 
units 
Optional All 
 
 
 
 

--- Page 27 ---

 
27 
 
R F F  REFERENCE 
 
Conditional Occurrence 99 
 
Function: A segment to identify various references associated with the claim (per tariff item). 
 
C506 REFERENCE M   
1153 Reference qualifier M an..3 AE = Authorisation for expense 
CAF = Acute cronic flag 
CL = for code list 
CMP = for complaint codes. 
CPT = Current Proced: Term: code 
DAG = for diagnosis codes. 
ICD = Int: Class: of Diseases code  
ICP = ICPC code 
IOD = for injured on duty 
indicator. 
IRS = for injury related to sport. 
IV = Invoice Number 
LAB = for laboratory number. 
LRN = Dental Lab Registration 
MAT = for maternity. 
MVA = for third party claims. 
POS = Place Of Service code 
PRO = for procedure codes. 
RDN = for referring doctor. 
RDO = for reference numbers assigned by 
radiologists. 
REG = for registration 
number(SAMDC) 
TIH = for treatment in hospital. 
TN = for transaction number 
TNO = Tooth Number/s 
TR = for tracer number 
1154 Reference  number C an..35 Data for qualifier(s) in element 
1153 
1156 Line  number C an..6 Line number 
     
C507 DATE / TIME / PERIOD C   
2005 Date / time / period qualifier M an..3 286 = service start date/time 
2380 Date / time / period M an..35 Data for qualifier in element 2005 
2379 Date / time / period format qualifier M an..3 102 = for CCYYMMDD format 
     
 
Example: RFF+TR:0000001’ 
 
 
 
 
 
 
 
 
 
 
 
 
Notes: 

--- Page 28 ---

 
28 
RFF - A segment to identify various references associated with the claim (per tariff item). 
Element Qualifier Data required Mandatory / Optional Supplier 
1153 AE Authorisation for 
expense 
Optional All 
 CAF Acute cronic flag Optional Pharmacy 
 CL code list Optional All 
 CMP Complaint code Optional All 
 CPT CPT description/s 
separated by / 
Optional All 
 DAG Diagnosis code Optional All 
 ICD ICD10 description/s 
separated by / 
Optional All 
 ICP ICPC description Optional All 
 IOD Y or N Optional All 
 IRS Y or N Optional All 
 IV Invoice Number Optional All 
 LAB Laboratory number Optional Pathologists 
 LRN Dental Lab Registration Optional ?? 
 MAT Y or N Optional All 
 MVA Y or N Optional All 
 POS Place Of Service code Optional All 
 PRO Procedure code Optional All 
 RAD Y or N Optional Radiologists 
 RDN Referring doctors Rams 
number 
Optional Pathologists 
 RDO Reference number Optional Radiologist 
 REG Registration 
number(SAMDC) 
Optional All 
 TIH Y or N Optional All 
 TN Transaction number Optional All 
 TNO Tooth Number/s  
up to 8 separated by / 
Optional Dentists 
 TR Tracer number Optional All 
 
Note for qualifier TNO: Due to the changes on the designation of tooth numbers published in the 
SADA DENTAL CODES 2016 document, the super-numerary tooth numbers are can now also be 
indicated with 2 numeric numbers followed by an “S”, e.g. 23S 
 
Example: RFF+TNO: 21/22/23S’ 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 

--- Page 29 ---

 
29 
 
FTX FREE  TEXT 
 
Conditional  Occurrence 9 
 
Function: For codes not available 
 
4451 TEXT  SUBJECT,  CODE M an..3 CMP = for description of complaint 
codes 
CPT = CPT description 
DAG = for description of diagnosis 
codes 
ICD = ICD description 
ICP = ICPC description 
ITM = for description of tariff 
codes. 
PRO = for description of procedure 
codes 
RDN = for description of referred 
by doctor 
 
     
4453 TEXT  FUNCTION CODED C an..3 NOT USED 
     
C107 TEXT  REFERENCE C  NOT USED 
4441 Free  text,  coded M an..3  
1131 Code  list  qualifier C an..3  
3055 Code list responsible agency coded C an..3  
     
C108 TEXT  LITERAL C   
4440 Free  text M an..70 Data for qualifier(s) in element 
4451 
4440 Free  text C an..70  
4440 Free  text C an..70  
4440 Free  text C an..70  
4440 Free  text C an..70  
     
 
Example: FTX+ITM+++GENERAL WARD’ 
 
Notes: 
 
FTX - For codes not available 
Element Qualifier Data required Mandatory / Optional Supplier 
4451 CMP Complaint description Optional All 
 DAG Diagnosis description Optional All 
 ITM Description of tariff 
code 
Optional All 
 PRO Procedure description Optional All 
 RAD Description used by 
Radiologist 
Optional Radiologist 
 RDN Referred by doctors 
name 
Optional All 
 
 
 

--- Page 30 ---

 
30 
 
PAT PAYMENT TERMS BASIS 
 
Conditional  Occurance 1 
 
Function: Used for deposits,interist, discount or levies on an account for the entire message. 
 
 
4279 PAYMENT TERMS TYPE 
QUALIFIER 
M an..3 22 = for discount per item. 
40 = additional pricing information. 
     
C110 PAYMENT TERMS C  NOT USED 
4277 Terms of payment identification M an..17  
1131 Code list qualifier C an..3  
3055 Code list responsible agency, coded C an..3  
4276 Terms of payment C an..35  
 Terms of payment C an..35  
     
C507 DATE/TIME/PERIOD C  NOT USED 
2005 Date/time/period qualifier M an..3  
2380 Date/time/period M an..35  
2379 Date/time/period format qualifier M an..3  
     
C112 TERMS TIME INFORMATION C  NOT USED 
2475 Payment time reference, coded M an..3  
2009 Time relation, coded C an..3  
2151 Time relation, coded C an..3  
2152 Number of periods C n..3  
     
C142 TERMS DISCOUNT/PENALTY C  NOT USED 
5482 Percentage C n..8  
2151 2151 C an..3  
5004 Monetary amount C n..18  
     
C516 MONETARY AMOUNT C   
5025 Monetary amount type qualifier M an..3 52 = for discount amount. 
301 = gross amount. 
302 = nett amount. 
5004 Monetary amount C n..18 Data for qualifier(s) in element 
5025 
6345 Currency, coded C an..3  
6343 Currency qualifier C an..3  
4405 Status, coded C an..3  
     
C501 PERCENTAGE DETAILS C   
5245 Percentage qualifier M an..3 12 = discount as a percentage. 
5482 Percentage M n..8 Data for qualifier(s) in element 
5245 
5249 Percentage basis qualifier C an..3  
     
 
Example: PAT+22+++++52:54+12:25’ 
 
 
 
 
 
 
 

--- Page 31 ---

 
31 
 
 
Notes: 
 
PAT - To indicate a discount for tariffed amounts per tariff code 
Element Qualifier Explanatory Notes Mandatory / Optional Supplier 
4279 22 To indicate that this is a 
discount 
Optional All 
5025 52 Actual discount amount Optional All 
5245 12 Discount percentage Optional All 
 
 
 
 
 

--- Page 32 ---

 
32 
 
TAX DUTY/TAX/FEE DETAILS 
 
Conditional  Occurrence 1 
 
Function: A segment that indicates the default rate of VAT (per tariff item 
 
5283 DUTY/TAX/FEE FUNCTION 
QUALIFIER 
M an..3 7 = for contribution levied by 
authority (VAT) 
     
C516 MONETARY AMOUNT C  NOT USED 
5025 Monetary amount type qualifier M an..3  
5004 Monetary amount C n..18  
6345 Currency, coded C an..3  
6343 Currency qualifier C an..3  
4405 Status, coded C an..3  
     
C241 DUTY/TAX/FEE TYPE C  NOT USED 
5153 Duty/tax/fee type, coded C an..3  
1131 Code list qualifier C an..3  
3055 Code list responsible agency, coded C an..3  
5125 Duty/tax/fee type C an..35  
     
C533 DUTY/TAX/FEE ACCOUNT DETAIL C  NOT USED 
5289 Duty/tax/fee account identification M an..6  
1131 Code list qualifier C an..3  
3055 Code list responsible agency, coded C an..3  
     
5286 DUTY/TAX/FEE ASSESSMENT 
BASIS 
C an..15 NOT USED 
     
C243 DUTY/TAX/FEE DETAIL C   
5279 Duty/tax/fee rate identification C an..7 “135” = to identify specific rate. 
1131 Code list qualifier C an..3  
3055 Code list responsible agency, coded C an..3  
5278 Duty/tax/fee rate C an..17 Data for qualifier(s) in element 
5279 
5273 Duty/tax/fee rate basis identification C an..12  
1131 Code list qualifier C an..3  
3055 Code list responsible agency, coded C an..3  
     
C529 PROCESSING INDICATOR C  NOT USED 
7365 Processing indicator, coded M an..3  
1131 Code list qualifier C an..3  
3055 Code list responsible agency, coded C an..3  
     
C516 MONETARY AMOUNT C  NOT USED 
5025 Monetary amount type qualifier M an..3  
5004 Monetary amount C n..18  
6345 Currency, coded C an..3  
6343 Currency qualifier C an..3  
4405 Status, coded C an..3  
     
5305 DUTY/TAX/FEE CATEGORY, 
CODED 
C an..3 NOT USED 
     
3446 PARTY TAX IDENTIFICATION 
NUMBER 
C an..20 NOT USED 
 

--- Page 33 ---

 
33 
 
Example:         TAX+7+++++135::14’ 
 
Notes: 
 
 
TAX - A segment that indicates the default rate of VAT (per tariff item). 
Element Qualifier Explanatory Notes Mandatory / Optional Supplier 
5283 7 Contribution levied by 
authority 
Optional All 
5279 135 Actual vat percentage 
rate 
Optional All 
 
 
 
 

--- Page 34 ---

 
34 
 
U N S  SECTION  CONTROL 
 
Mandatory  Occurrence  1 
 
Function: To  separate  header  and  detail  sections  of  the  message. 
 
0081 SECTION  IDENTIFICATION  
CODED 
M a 1 C for collision. 
     
 
Example: UNS+C’ 
 
Notes: 
 
UNS - A segment that separates header, detail, and summary sections of message. 
Element Qualifier Explanatory Notes Mandatory / Optional Supplier 
0081 C Collision indicator Mandatory All 
 
 

--- Page 35 ---

 
35 
 
 
 Segment Group 4. RFF-FTX-QTY-MOA-PAT-TAX 
 
 A group of segments used to identify medicines and other medical consumables used. 
 
R F F  REFERENCE 
 
Mandatory Occurrence 1 
 
Function: A segment to identify various references associated with the claim (per medicine 
  item). 
 
C506 REFERENCE M   
1153 Reference qualifier M an..3 AE = Authorisation for expense. 
CAF = for acute cronic flag. 
CL = for code list. 
CLF = for code list flag. 
CMP = for complaint codes. 
DAG = for diagnosis codes. 
DRG = for medicines and 
consumables code. 
EAN = for EAN code. 
IC = for item count. 
IGC = for ingredient count. 
ICD = for ICD10 code 
IOD = for injured on duty 
indicator. 
IV = for invoice number. 
MAT = for maternity. 
MIX = for mixture 
MVA = for third party claims. 
NDS = number of days supply 
NRF = for new / repeat item flag. 
OTC = Over the counter item. 
PRE = for prescription number. 
PRO = for procedure codes. 
RFL = for repeat flag. 
RN = for repeat number. 
RRS = for reject reason. 
TTC = Technicians tariff code. 
TTO = TO take out medicine. 
GEN = for generic medicine. 
TLN = for technician laboratory 
number 
TN = for transaction number. 
TR = for tracer number. 
1154 Reference  number C an..35 Data for qualifier(s) in element 
1153 
1156 Line  number C an..6 Line number. 
     
C507 DATE / TIME / PERIOD C   
2005 Date / time / period qualifier M an..3 286 = service(invoice) start 
date/time 
287 = service end date/time 
2380 Date / time / period M an..35 data for qualifier in element 2005 
2379 Date / time / period format qualifier M an..3 102 = CCYYMMDD format 
     
 

--- Page 36 ---

 
36 
Example: RFF+DRG:720461’ 
 
 
 
 
Notes: 
 
RFF -  A segment to identify various references associated with the claim (per medicine item). 
Element Qualifier Data required Mandatory / 
Optional 
Supplier 
1153 AE Authorisation for 
expense 
Optional All 
 CAF 0 = acute/ongoing 
1 or Y = chronic 
2 = PAT(Pharmacy 
assisted therapy) 
3 = chemo 
4 = surgical 
5 = maternity 
6 = anti-rejection drugs 
7 = ex gratia 
8 = additional benefit 
A = appliances 
B = Blood products 
C = Alternative 
medicine 
(homeopathic/naturopat
hic) 
H = HIV 
L = Life sustaining 
N = acute/ongoing 
O = Organ transplant 
R = renal failure 
Y or 1 = Chronic 
Optional All 
 CL Code Optional All 
 CLF Code Optional Pharmacy 
 CMP Code Optional All 
 DAG Code Optional All 
 DRG Medicine and 
consumable items code 
“MEDIC” s/b used if 
not NAPPI code / 
‘MIXTURE’ if mixture 
item 
Mandatory All 
 EAN EAN bar code Optional Pharmacy 
 GEN Generic code Optional All 
 IC Sequential item count Optional Pharmacy 
 ICD ICD10 code/s 
separated by / 
Optional All 
 IGC Ingredient count Optional Pharmacy 
 IOD Y or N Optional All 
 IV Invoice number Optional Hospital 
 MAT Y or N Optional All 
 MIX Nappi code Optional All 
 MVA Y or N Optional All 
 NDS Number of days supply Optional Pharmacy 
 NRF Y or N Optional Pharmacy 

--- Page 37 ---

 
37 
 OTC Y or N Optional Pharmacy 
 PRE Prescription number Optional Pharmacy 
 PRO Code Optional All 
 RFL Y or N Optional Pharmacy 
 RN Repeat number Optional Pharmacy 
 RRS Reject reason code Optional Pharmacy 
 TLN Technician laboratory 
number 
Optional Dental Technician 
 TN Transaction number Optional All 
 TR Tracer number Optional All 
 TTC Technician tariff code Optional Dental Technician 
 TTO To take out medicine Optional Hospitals 
1156  Line number Optional All 
 
 
 
 
 

--- Page 38 ---

 
38 
 
FTX FREE  TEXT 
 
Conditional  Occurrence 9 
 
Function: To provide free form textual information relating to the description of medicines  
 where appropriate codes are not available (per medicine item). 
 
4451 TEXT  SUBJECT,  CODE M an..3 DAG = for Diagnosois description 
DOS = For dosage 
ICD = for ICD10 description 
MED = for description of 
medicines. 
MIX = for mixture description. 
ABR = Usage of medicine 
     
4453 TEXT  FUNCTION CODED C an..3 NOT USED 
     
C107 TEXT  REFERENCE C  NOT USED 
4441 Free  text,  coded M an..3  
1131 Code  list  qualifier C an..3  
3055 Code list responsible agency coded C an..3  
     
C108 TEXT  LITERAL C   
4440 Free  text M an..70 Data for qualifier(s) in element 
4451 
4440 Free  text C an..70  
4440 Free  text C an..70  
4440 Free  text C an..70  
4440 Free  text C an..70  
     
 
Example: FTX+MED+++DIPRIVAN AMPS20ML’ 
 
Notes: 
 
FTX - To provide free form textual information relating to the description of medicines where 
appropriate codes are not available (per medicine item). 
Element Qualifier Data required Mandatory / Optional Supplier 
4451 DAG Diagnosis description Optional All 
  DOS Dosage description Optional All 
  DOS Dosage description Optional All 
 ICD ICD10 Description/s 
separated by / 
Optional All 
 MIX Description of medicine Optional All 
 ABR Description of usage of 
medicine 
Optional All 
 
 
 
 

--- Page 39 ---

 
39 
 
QTY QUANTITY 
 
Conditional  Occurrence 9 
 
Function: This segment provides the quantity of medicines issued (per medicine item). 
 
C186 QUANTITY  DETAILS M   
6063 Quantity  qualifier C an..3 48 = for quantity received. 
MIN = minutes for mixtures 
6060 Quantity M n..15 Data for qualifier(s) in element 
6063 
6411 Measure  unit  qualifier C an..3  
     
 
Example: QTY+48:200’ 
 
Notes: 
 
QTY - This segment provides the quantity of medicines issued (per medicine item). 
Element Qualifier Data required Mandatory / Optional Supplier 
6063 48 Actual quantity issued Optional All 
 MIN Minutes taken to make 
up mixture 
Optional All 
 
 
 
 

--- Page 40 ---

 
40 
 
MOA MONETARY AMOUNT 
 
Conditional  Occurrence 9 
 
 
Function: To specify monetary amounts. 
 
5007 MONETARY FUNCTION 
QUALIFIER 
M an..3 24 = for value of medicines/consumables 
per item. 
25 = for maximum gross price. 
26 = for gross price. 
27 = Additional charge for mixture 
 
     
C516 MONETARY AMOUNT C   
5025 Monetary amount type qualifier M an..3 38 = for item value. 
5004 Monetary amount C n..18 Data for qualifier(s) in element 
5025 
6345 Currency coded C an..3  
6343 Currency qualifier C an..3  
4405 Status coded C an..3  
     
C516 MONETARY AMOUNT C  NOT USED 
5025 Monetary amount type qualifier M an..3  
5004 Monetary amount C n..18  
6345 Currency coded C an..3  
6343 Currency qualifier C an..3  
4405 Status coded C an..3  
     
C516 MONETARY AMOUNT C  NOT USED 
5025 Monetary amount type qualifier M an..3  
5004 Monetary amount C n..18  
6345 Currency coded C an..3  
6343 Currency qualifier C an..3  
4405 Status coded C an..3  
     
C516 MONETARY AMOUNT C  NOT USED 
5025 Monetary amount type qualifier M an..3  
5004 Monetary amount C n..18  
6345 Currency coded C an..3  
6343 Currency qualifier C an..3  
4405 Status coded C an..3  
     
C516 MONETARY AMOUNT C  NOT USED 
5025 Monetary amount type qualifier M an..3  
5004 Monetary amount C n..18  
6345 Currency coded C an..3  
6343 Currency qualifier C an..3  
4405 Status coded C an..3  
     
C516 MONETARY AMOUNT C  NOT USED 
5025 Monetary amount type qualifier M an..3  
5004 Monetary amount C n..18  
6345 Currency coded C an..3  
6343 Currency qualifier C an..3  
4405 Status coded C an..3  
Example: MOA+24+38:11660’ 
Notes: 

--- Page 41 ---

 
41 
 
MOA - The monetary value of medicines/consumables issued (per medicine item). 
Element Qualifier Explanatory Notes Mandatory / Optional Supplier 
5007 24 Value of medicine / 
consumables per item 
Optional All 
 25 Maximum gross price Optional Pharmacy 
 26 Gross price Optional Pharmacy 
 27 Additional charge for 
mixture 
Optional All 
5025 38 Actual monetary 
amount 
Optional All 
 

--- Page 42 ---

 
42 
 
PAT PAYMENT TERMS BASIS 
 
Conditional  Occurance 1 
 
Function: For discount per item. 
 
4279 PAYMENT TERMS TYPE 
QUALIFIER 
M an..3 22 = for discount per item. 
40 = additional pricing information. 
     
C110 PAYMENT TERMS C  NOT USED 
4277 Terms of payment identification M an..17  
1131 Code list qualifier C an..3  
3055 Code list responsible agency, coded C an..3  
4276 Terms of payment C an..35  
 Terms of payment C an..35  
     
C507 DATE/TIME/PERIOD C  NOT USED 
2005 Date/time/period qualifier M an..3  
2380 Date/time/period M an..35  
2379 Date/time/period format qualifier M an..3  
     
C112 TERMS TIME INFORMATION C  NOT USED 
2475 Payment time reference, coded M an..3  
2009 Time relation, coded C an..3  
2151 Time relation, coded C an..3  
2152 Number of periods C n..3  
     
C142 TERMS DISCOUNT/PENALTY C  NOT USED 
5482 Percentage C n..8  
2151 2151 C an..3  
5004 Monetary amount C n..18  
     
C516 MONETARY AMOUNT C   
5025 Monetary amount type qualifier M an..3 52 = for discount amount. 
301 - gross amount. 
302 - nett amount. 
303 - single exit price. 
304 - service fee. 
5004 Monetary amount C n..18 Data for qualifier(s) in element 
5025 
6345 Currency, coded C an..3  
6343 Currency qualifier C an..3  
4405 Status, coded C an..3  
     
C501 PERCENTAGE DETAILS C   
5245 Percentage qualifier M an..3 12 = discount as a percentage. 
5482 Percentage M n..8 Data for qualifier(s) in element 
5245 
5249 Percentage basis qualifier C an..3  
     
 
Example: PAT+22+++++52:54+12:25’ 
 
 
 
 
 
 

--- Page 43 ---

 
43 
 
 
 
 
Notes: 
 
PAT -  Used to indicate discount for medicines/consumables per item. 
Element Qualifier Explanatory Notes Mandatory / Optional Supplier 
4279 22 To indicate that this is a 
discount 
Optional All 
5025 52 Actual discount amount Optional All 
5245 12 Discount percentage Optional All 
 
 
 
 
 
 
 
 

--- Page 44 ---

 
44 
 
TAX  DUTY/TAX/FEE DETAILS 
 
Conditional  Occurrence 1 
 
Function: A segment that indicates the default rate of VAT (per medicine item), only if  
  different from the default value. 
 
5283 DUTY/TAX/FEE FUNCTION 
QUALIFIER 
M an..3 7 = for contribution levied by 
authority (VAT) 
     
C516 MONETARY AMOUNT C  NOT USED 
5025 Monetary amount type qualifier M an..3  
5004 Monetary amount C n..18  
6345 Currency, coded C an..3  
6343 Currency qualifier C an..3  
4405 Status, coded C an..3  
     
C241 DUTY/TAX/FEE TYPE C  NOT USED 
5153 Duty/tax/fee type, coded C an..3  
1131 Code list qualifier C an..3  
3055 Code list responsible agency, coded C an..3  
5125 Duty/tax/fee type C an..35  
     
C533 DUTY/TAX/FEE ACCOUNT DETAIL C  NOT USED 
5289 Duty/tax/fee account identification M an..6  
1131 Code list qualifier C an..3  
3055 Code list responsible agency, coded C an..3  
     
5286 DUTY/TAX/FEE ASSESSMENT 
BASIS 
C an..15 NOT USED 
     
C243 DUTY/TAX/FEE DETAIL C   
5279 Duty/tax/fee rate identification C an..7 135 = to identify specific rate. 
1131 Code list qualifier C an..3  
3055 Code list responsible agency, coded C an..3  
5278 Duty/tax/fee rate C an..17 Data for qualifier(s) in element 
5279 
5273 Duty/tax/fee rate basis identification C an..12  
1131 Code list qualifier C an..3  
3055 Code list responsible agency, coded C an..3  
     
C529 PROCESSING INDICATOR C  NOT USED 
7365 Processing indicator, coded M an..3  
1131 Code list qualifier C an..3  
3055 Code list responsible agency, coded C an..3  
     
C516 MONETARY AMOUNT C  NOT USED 
5025 Monetary amount type qualifier M an..3  
5004 Monetary amount C n..18  
6345 Currency, coded C an..3  
6343 Currency qualifier C an..3  
4405 Status, coded C an..3  
     
5305 DUTY/TAX/FEE CATEGORY, 
CODED 
C an..3 NOT USED 
     
3446 PARTY TAX IDENTIFICATION 
NUMBER 
C an..20 NOT USED 

--- Page 45 ---

 
45 
     
 
Example: TAX+7+++++135::14’ 
 
Notes: 
 
TAX - A segment that indicates the default rate of VAT (per medicine item), only if different from the 
default value. 
Element Qualifier Explanatory Notes Mandatory / Optional Supplier 
5283 7 Contribution levied by 
authority 
Optional All 
5279 135 Actual vat percentage 
rate 
Optional All 
 
 
 
 

--- Page 46 ---

 
46 
 
  4.1.3 Summary Section 
 
C N T  CONTROL  TOTALS 
 
Mandatory  Occurrence 99 
 
Function: A segment providing control totals used to indicate the number and values of  
  tariffs, modifiers, medicines in any particular claim (per claim). 
 
C270 CONTROL M   
6069 Control  qualifier M an..3 22 = for number of tariff codes. 
23 = for number of modifier codes. 
24 = for number of medicine codes. 
25 = for total value of tariff codes. 
26 = for total value of modifiers. 
27 = for total value of medicines. 
28 = for total value of discount. 
29 = for total value of levy. 
30 = for total gross price. 
31 = for claim total member levies. 
32 = for total MMAP surcharge. 
33 = for claim total net price. 
34 = for claim total CPO discount. 
35 = for claim total sales tax. 
36 = for claim total professional 
checking fee. 
37 = for claim total amount due by 
scheme. 
38 = for total number of items. 
39 = for claim total number of Rx's. 
6066 Control  value M n..18 Data for qualifier(s) in element 
6069 
6411 Measure  unit qualifier C an..3  
     
C270 CONTROL C  NOT USED 
6069 Control  qualifier M an..3  
6066 Control  value M n..18  
6411 Measure  unit qualifier C an..3  
     
C270 CONTROL C  NOT USED 
6069 Control  qualifier M an..3  
6066 Control  value M n..18  
6411 Measure  unit qualifier C an..3  
     
C270 CONTROL C  NOT USED 
6069 Control  qualifier M an..3  
6066 Control  value M n..18  
6411 Measure  unit qualifier C an..3  
     
     
     
C270 CONTROL C  NOT USED 
6069 Control  qualifier M an..3  
6066 Control  value M n..18  
6411 Measure  unit qualifier C an..3  
     
 
Example: CNT+22:1’ 

--- Page 47 ---

 
47 
 
Notes: 
 
CNT - A segment providing control totals used to indicate the number and values of tariffs, modifiers, 
medicines in any particular claim (per claim). 
Element Qualifier Data required Mandatory / Optional Supplier 
6069 22 Number of tariff codes Optional All 
 23 Number of modifier 
codes 
Optional All 
 24 Number of medicine 
codes 
Optional All 
 25 Total value of tariff 
codes 
Optional All 
 26 Total value of modifier 
codes 
Optional All 
 27 Total value of medicine 
codes 
Optional All 
 28 Total value of discount Optional All 
 29 Total value of levy Optional All 
 30 Total gross price Optional Pharmacy 
 31 Claim total member 
levies 
Optional Pharmacy 
 32 Total MMAP surcharge Optional Pharmacy 
 33 Claim nett price Optional Pharmacy 
 34 Total CPO discount Optional Pharmacy 
 35 Total claim sales tax Optional Pharmacy 
 36 Total professional 
checking fee 
Optional Pharmacy 
 37 Total amount due by 
scheme 
Optional Pharmacy 
 38 Total number of items Optional Pharmacy 
 39 Total number of Rx's Optional Pharmacy 
 
 

--- Page 48 ---

 
48 
 
U N T  MESSAGE  TRAILER 
 
Mandatory  Occurrence  1 
 
Function: A service segment to end the message and check the completeness of the message 
  (i.e. the total number of segments in the message and the control reference number 
  of the message).(Translator should do all this) 
 
0074 NUMBER  OF  SEGMENTS  IN  A  
MESSAGE 
M n..6 Actual number of segments in a 
message. 
     
0062 MESSAGE  REFERENCE  NUMBER M an..14 This number which is allocated is 
unique for each message and will 
be the same as the UNH - Message 
Header. 
 
     
 
Example: UNT+223+0001782’ 
 
Notes: 
 
UNT - A service segment to end the message and check the completeness of the message (i.e. the total 
number of segments in the message and the control reference number of the message).(Translator should 
do all this) 
Element Qualifier Data required Mandatory / Optional Supplier 
0074  Actual number of 
segments 
Mandatory All 
0062  Interchange number Mandatory All 
 
 

--- Page 49 ---

 
49 
 
 4.2 Message Structure 
 
  4.2.1 Segment Table 
 
 TAG NAME Req. Req. Rep. Rep. 
M 99 
BGM 
DCR 
DTM 
NAD 
RFF 
DTM 
RFF 
Beginning of message 
Documentary requirement 
Date / time reference 
Segment Group 1 
Name and address 
References 
Segment Group 2 
Date / time reference 
References 
C 
C 
C 
M 
C 
M 
C 
1 
9 
9 
1 
9 
M 999 
1 
99 
LIN 
Segment Group 3 
Line item 
RFF 
FTX 
UNS 
Reference 
Free text 
Duty / tax / fee details 
Section control 
M 999 
M 1 
C 99 
9 C 
C 
RFF 
FTX 
QTY 
MOA 
Segment Group 4 
References 
Free text 
Quantity 
Monetary amounts 
M 
M 
C 
C 
C 
1 
1 
9 
9 
9 
PAT Payment terms basis C 99 
TAX Duty / tax / fee details C 9 
PAT Payment terms basis 1 C 
TAX 1 
C 9999 
PAT 
TAX 
CNT 
Payment terms basis 
Duty / tax / fee details 
Control totals 
1 
1 
99 
C 
C 
M 
UNH Message header M 
UNT Message trailer M 1 
FTX Free text 
99 C 
FTX Free text C 9 
1 
 
 
 
 
 
 
 
 

--- Page 50 ---

 
50 
 
 
  4.2.2 Branching diagram 
BGM
C
DCR TAXDTM Grp 1 PAT
NAD
Grp 2
DTM
Grp 4
LIN
Grp 3FTXFTX
UNSFTX PAT TAXRFF
CNT
1
C CMC C M
M M
C C M
M
CMCCC C
M
C C C C C
QTY MOA PAT TAXFTX
M9 999 99 999
1 1
99
9 9 999
1
9999119 199
RFF
1
9 9 9 1 1
M
UNH
1 M 1
UNT
9
RFF
C 99
RFF
C 99
 
 
 
 

--- Page 51 ---

 
51 
 
 
  4.3 Data Segments (Alphabetic Sequence) 
 
  The following segments form part of the South African Medical Claims Message.  
  The full definitions of these segments are to be found in the UN/EDIFACT Data  
 Segments Directory (EDSD), Part V of the UNTDID, UN Trade Data   
 Interchange Directory. 
 
  BGM Beginning of message. 
  CNT Control totals. 
  DCR Documentary requirement. 
  DTM Date/time reference. 
  FTX Free text. 
  LIN Line item. 
  MOA Monetary amounts. 
  NAD Name and address. 
  PAT Payment terms basis. 
  QTY Quantity. 
  RFF References. 
  TAX Duty/tax/fee details. 
  UNH Message header. 
  UNS Section control. 
  UNT Message trailer. 
 
 