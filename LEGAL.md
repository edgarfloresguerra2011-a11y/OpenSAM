# Legal Notice & Compliance

## No Government Affiliation

**OpenSAM is an independent, open-source project. It is not affiliated with,
endorsed by, sponsored by, or in any way officially connected with:**

- The U.S. General Services Administration (GSA)
- SAM.gov
- Any other U.S. federal, state, or local government agency

All trademarks, service marks, and trade names referenced in this project
are the property of their respective owners.

## SAM.gov Public API — Terms of Use

OpenSAM uses the [SAM.gov Public Opportunities API](https://open.gsa.gov/api/get-opportunities-public-api/).
By using OpenSAM with a live SAM.gov API key you agree to the
[GSA API Terms of Use](https://open.gsa.gov/api/api-terms-of-use/). In particular:

1. **You are responsible for your API key.** Do not share it, commit it to
   version control, or expose it in client-side code. OpenSAM stores it as a
   Supabase secret; do not override that pattern.
2. **Rate limits apply.** The API enforces throughput limits per key. OpenSAM
   implements exponential backoff and retries, but you must not attempt to
   circumvent the limits.
3. **No warranty of data accuracy.** SAM.gov data is provided "as is". Verify
   every opportunity on sam.gov before submitting a proposal.
4. **Permitted use.** The API is intended for legitimate business development
   and market research. Do not use it to spam contracting officers, build
   unauthorized derivative databases, or resell the raw data.
5. **Attribution.** When displaying data sourced from SAM.gov, include a
   visible notice that the data is from SAM.gov.

## AI-Generated Content

OpenSAM uses Google Gemini 1.5 Pro to generate:

- Opportunity viability scores
- Risk summaries
- Draft proposal openings

This output is **AI-generated and may contain errors**. Always:

- Verify every claim against the original solicitation document.
- Have a qualified human review and edit any proposal text before submission.
- Treat the viability score as a triage signal, not a procurement decision.

AliceLabs LLC is not liable for any decisions made solely on the basis of
AI-generated output from this tool.

## Data Handling

OpenSAM stores the following PII in your Supabase project:

| Field                      | Encrypted at rest                       | Notes                             |
| -------------------------- | --------------------------------------- | --------------------------------- |
| `company_profiles.ein`     | Yes (Vault + pgsodium, migration `003`) | US Employer Identification Number |
| `company_profiles.uei`     | Yes (Vault + pgsodium, migration `003`) | SAM.gov Unique Entity Identifier  |
| `company_profiles.name`    | No                                      | Public business name              |
| `auth.users.email`         | Yes (Supabase default)                  | Account email                     |
| `saved_opportunities` rows | No (operational data)                   | Public SAM.gov data               |
| `bid_analyses` rows        | No (operational data)                   | AI-generated, scoped to user      |

For federal contractors subject to **NIST 800-171 / CMMC**, note that
Supabase is **not** FedRAMP-authorized. If your contract requires FedRAMP
Moderate or higher, deploy OpenSAM in an authorized environment
(AWS GovCloud, Azure Government) and replace Supabase with an authorized
Postgres provider.

## Export Control

OpenSAM does not handle export-controlled technical data. However, your
configuration may. If you process ITAR/EAR-controlled information through
OpenSAM, ensure your entire deployment chain is authorized for that data
classification.

## Disclaimer of Warranty

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. (See `LICENSE` for the full MIT text.)
