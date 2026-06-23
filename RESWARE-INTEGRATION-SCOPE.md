# Inksent ↔ ResWare Integration — Technical Scope

**Purpose:** define the integration so Summit Settlement's ResWare admin (or their Qualia/ResWare rep) can grant access, and so Inksent can build it. Goal, in Summit's words: *"create an order without leaving ResWare, and milestones feed back into our system."*

> Status: planning. The Inksent-side connector is **not yet built** — it's blocked on the access items in §6. ResWare's full API specs/WSDLs are partner-gated; method-level details below are confirmed from public vendor integrations (Snapdocs, Proof) and will be finalized against Summit's instance + the ResWare API package.

---

## 1. What we're building

A **bidirectional, multi-tenant integration** between Inksent's signing platform and Summit's ResWare instance:

- **Order out (ResWare → Inksent):** Summit creates the signing order inside ResWare and assigns Inksent as the signing vendor. ResWare pushes the order to Inksent; Inksent auto-creates the signing and begins dispatch — no double entry.
- **Milestones in (Inksent → ResWare):** As the signing progresses, Inksent pushes status events back onto the ResWare file as **Action Events** (not just notes), and uploads the executed documents.

Built **config-driven / multi-tenant** from day one (endpoint + credentials + action-code map per title company), so the same connector onboards future ResWare clients.

---

## 2. Architecture

```
                 (1) order created + Inksent assigned
   ResWare  ───────────────────────────────────────────▶  Inksent inbound endpoint
 (Summit's                                                  → create order → dispatch notary
  instance)
      ▲                                                            │
      │  (2) Action Events (milestones) via SOAP "...Basic"        │
      │  (3) executed documents + note via REST                    ▼
      └──────────────────────────────────────────────────  Inksent connector
```

- **Transport:** ResWare = .NET/WCF SOAP at the core, with a REST layer.
  - **Order receive + status push:** SOAP over the **`basicHttpBinding` ("...Basic")** endpoints (e.g. `ReceiveSigningCompleteServiceBasic`) — the plain-SOAP variant third parties use.
  - **Documents / notes:** ResWare **REST API** (resolve file by number → upload documents → post note).
- **Auth:** ResWare **Partner** model — a web-enabled partner employee (username/password) and/or a **Subscription Key**, plus our **Partner GUID**. Access is scoped to files Summit assigns to the Inksent partner record.

---

## 3. Order data we ingest (ResWare → Inksent)

Mapping ResWare order fields → Inksent order. Inksent fields:

| Inksent field | Source from ResWare |
|---|---|
| `signing_type` (purchase/refi/heloc/reverse/loan_mod/other) | loan/transaction type |
| `signing_date`, `signing_time` | scheduled signing appointment |
| `property_address`, city, state, zip | property / signing location |
| `signer_name`, `signer_phone`, `signer_email` | borrower / signing party |
| `client_company`, `client_name`, `client_email`, `client_phone` | Summit office + assigned escrow/processor contact |
| `client_reference` | ResWare **file number** (cross-reference both ways) |
| `special_instructions`, `language_needed` | order notes / instructions |
| `documents` (loan package) | document(s) delivered with/after the order |

We store the ResWare **file number + internal file_id** on the Inksent order so every status push targets the right file.

---

## 4. Milestones we push back (Inksent → ResWare Action Events)

Each Inksent lifecycle event maps to a ResWare **Action Event** with a numeric code that Summit and Inksent agree on (codes are arbitrary/per-instance — example only):

| Inksent milestone | Suggested Action Event |
|---|---|
| Notary assigned | `notary_assigned` |
| Notary confirmed | `signing_confirmed` |
| En route | `notary_en_route` |
| Arrived | `notary_arrived` |
| Signing complete | `signing_completed` |
| Documents uploaded (scan-backs) | `documents_uploaded` |
| Problem / exception (no-show, reschedule, cancel) | `signing_exception` |

Executed documents and a confirmation note are pushed via REST when the signing completes.

---

## 5. Build phases (Inksent side)

1. **Connector scaffold** — multi-tenant config (per-client endpoint, credentials, action-code map), ResWare SOAP + REST clients, file-id resolution.
2. **Inbound order** — receive ResWare order → validate → create Inksent order → ack.
3. **Outbound milestones** — map Inksent events → Action Events; push on each transition.
4. **Documents** — push executed package + note back to the file.
5. **End-to-end test** against a Summit test file; then pilot on live low-volume; then full cutover.

---

## 6. What we need from Summit's ResWare admin (access checklist)

1. **ResWare server URL / API endpoint** (Summit's instance).
2. **Partner credentials** — a web-enabled partner employee login (username/password) and/or **Subscription Key** — and our **Partner GUID** after Inksent is added as a Partner.
3. **ResWare version**, and confirmation the **`basicHttpBinding` ("...Basic") SOAP endpoints** are enabled (and Basic Auth for WCF if needed).
4. **Partner web permissions** for Inksent: **add/edit/cancel signings, write documents, write action events** — scoped to assigned files.
5. **Action Event code map** (agree the table in §4) configured in ResWare → Resware-to-Resware Partner Mappings.
6. **Document-type mapping** (which ResWare doc types our uploads land as).
7. A **test file** in their environment to run end-to-end before go-live.

**From Qualia/ResWare (Inksent obtains):** the **ResWare API assistance package** (docs, REST/WCF samples, WSDLs, support hours). Optionally a Qualia **Marketplace** vendor application with Summit as launch partner.

---

## 7. Security & ops

- Per-instance credentials stored as encrypted env/secret config; never in the repo.
- Access scoped to Summit-assigned files only (ResWare partner model).
- Borrower NPI handled per Inksent's existing GLBA/CCPA controls (encrypted storage, 14-day doc auto-purge, access controls).
- Idempotent inbound (dedupe by ResWare file number) and retried outbound milestone pushes.

## 8. Open questions for their admin / our kickoff call

- Confirm SOAP `...Basic` endpoints + which order-receive service their version exposes.
- Confirm whether documents come with the order push or via a separate retrieval.
- Agree the §4 action-event codes and §6 doc-type mappings.
- Preferred test file + a 20-minute technical kickoff.
