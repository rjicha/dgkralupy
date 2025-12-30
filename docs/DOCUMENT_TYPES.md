# Document Types & Conventions

This document defines the types of technical documents used in this project and when to use each type.

## Document Storage

All technical documents are stored in `/docs/issues/` with sequential numbering.

## Numbering Convention

Documents use zero-padded sequential numbering: `01`, `02`, `03`, etc.

**Current sequence: 05** (next available number)

## Document Types

### 1. RFC (Request for Comments)

**Filename format:** `XX-topic-name.md`
**Example:** `03-dark-mode-toggle.md`

**When to use:**
- Proposing a new feature or significant change
- Need to gather feedback before implementation
- Describing a problem and potential solutions
- Architectural decisions that affect multiple components
- Changes that impact user experience

**Template sections:**
- Status (Draft, Under Review, Approved, Implemented)
- Author & Date
- Executive Summary
- Problem Statement
- Current Implementation Analysis
- Proposed Solution
- Implementation Plan (high-level phases)
- Alternative Approaches Considered
- Success Metrics
- References

**Example triggers:**
- "prepare rfc for adding user authentication"
- "write an rfc about performance optimization"
- "create rfc for newsletter feature"

### 2. Design Document

**Filename format:** `XX-topic-name-design.md`
**Example:** `03-api-architecture-design.md`

**When to use:**
- Designing system architecture
- Database schema design
- API design
- Complex algorithm or data flow
- Integration between multiple systems
- Technical specifications without implementation steps

**Template sections:**
- Status & Metadata
- Overview
- Goals & Non-Goals
- System Architecture
- Data Model / Schema
- API Specifications
- Component Interactions
- Security Considerations
- Performance Considerations
- Open Questions

**Example triggers:**
- "design the database schema for user profiles"
- "create a design doc for the api structure"
- "design document for the caching layer"

### 3. Implementation Plan (IP)

**Filename format:** `XX-topic-name-ip.md`
**Example:** `03-dark-mode-ip.md` or `02-admin-image-handling-ip.md`

**When to use:**
- After an RFC is approved
- Breaking down a feature into concrete steps
- Creating a detailed execution plan with checklists
- When you need step-by-step implementation guidance

**Template sections:**
- Issue reference & metadata
- Executive Summary
- Pre-Implementation Checklist
- Implementation Steps (detailed with code examples)
- Code Review Checklist
- Testing Plan
- Verification Commands
- Rollback Plan
- Post-Implementation tasks

**Example triggers:**
- "prepare ip for issue 03"
- "create implementation plan for dark mode"
- "make an ip for the approved rfc 02"

## Decision Matrix

Use this to automatically choose the right document type:

| User Request | Document Type | Reasoning |
|--------------|---------------|-----------|
| "prepare rfc for [feature]" | RFC | New feature proposal |
| "write a design doc for [system]" | Design Doc | Architecture/system design |
| "prepare ip for issue XX" | IP | Execution plan for existing issue |
| "create implementation plan for [topic]" | IP | Breaking down into steps |
| "design the api for [feature]" | Design Doc | API/schema design |
| "propose [change]" | RFC | Change proposal |

**Default behavior:**
- If the request is about "how to build/design a system" → **Design Doc**
- If the request is about "proposing a feature/change" → **RFC**
- If the request references an existing issue/RFC → **IP**
- If unclear, ask the user which type they prefer

## Auto-numbering Logic

When creating a new document:

1. **Scan `/docs/issues/`** for existing documents
2. **Extract the highest number** (e.g., `02-admin-image-handling.md` → 02)
3. **Increment by 1** → Next number is 03
4. **Zero-pad** to 2 digits → `03`
5. **Construct filename**: `03-[topic-slug].[type-suffix].md`

### Examples:
- User: "prepare rfc for dark mode"
  - Filename: `03-dark-mode.md`
  - Type: RFC

- User: "create ip for issue 03"
  - Filename: `03-dark-mode-ip.md`
  - Type: Implementation Plan

- User: "design doc for new api"
  - Filename: `03-new-api-design.md`
  - Type: Design Document

## Relationship Between Documents

**Typical workflow:**

```
RFC (03-feature.md)
    ↓
[Review & Approval]
    ↓
Implementation Plan (03-feature-ip.md)
    ↓
[Implementation]
    ↓
[Testing & Deployment]
```

**Or for design-heavy work:**

```
Design Doc (03-system-design.md)
    ↓
[Review & Refinement]
    ↓
RFC (if needed for feature proposal)
    ↓
Implementation Plan (03-system-ip.md)
```

## Document Metadata

All documents should include:

```markdown
# [Document Type]: [Title]

**Status**: [Draft | Under Review | Approved | Implemented | Rejected]
**Author**: [Role/Name]
**Date**: YYYY-MM-DD
**Last Updated**: YYYY-MM-DD
**Related**: [Links to related RFCs, IPs, code files]
```

## Status Definitions

- **Draft**: Initial version, work in progress
- **Under Review**: Awaiting feedback from stakeholders
- **Approved**: Ready for implementation
- **Implemented**: Work completed
- **Rejected**: Proposal declined (with reasoning)
- **Superseded**: Replaced by another document

## Templates

Templates for each document type are stored in `/docs/templates/`:

- `rfc-template.md` - RFC template
- `design-doc-template.md` - Design document template
- `ip-template.md` - Implementation plan template

## Quick Reference

**To get Claude to automatically create the right document:**

1. "prepare rfc for [topic]" → Creates `0X-topic.md` (RFC)
2. "prepare ip for issue 0X" → Creates `0X-topic-ip.md` (IP)
3. "design doc for [system]" → Creates `0X-system-design.md` (Design Doc)

Claude will:
- ✅ Auto-increment the issue number
- ✅ Choose the right template
- ✅ Place it in `docs/issues/`
- ✅ Use proper naming conventions
- ✅ Fill in metadata (date, status, etc.)

---

**Last Updated**: 2025-12-30
**Next Available Number**: 08
