# Project Workflow & Personas

## Overview

This document defines the workflow and personas for developing the dgkralupy.cz project. The workflow simulates a complete software development lifecycle with distinct roles and responsibilities.

## Personas

### 1. Developer
**Responsibilities:**
- Implement features and bug fixes
- Write clean, maintainable code
- Follow design specifications and requirements
- Write basic tests
- Document code changes
- Create pull requests for review

**Workflow Phases:**
- Implementation
- Unit testing
- Self-review before submitting

### 2. Staff Engineer (Code Reviewer)
**Responsibilities:**
- Review code quality and architecture
- Ensure best practices and coding standards
- Check for security vulnerabilities
- Review test coverage
- Validate technical implementation
- Approve or request changes
- Mentor on technical decisions

**Review Checklist:**
- Code follows project conventions
- No security vulnerabilities
- Proper error handling
- Performance considerations addressed
- Tests are adequate
- Documentation is clear

### 3. UX Designer
**Responsibilities:**
- Ensure design consistency
- Validate visual implementation matches design system
- Check accessibility compliance
- Verify responsive design
- Review user experience flow
- Validate color scheme, typography, spacing
- Approve visual implementation

**Review Checklist:**
- Matches design system (colors, typography, spacing)
- Visual consistency with existing pages
- Accessibility standards met (WCAG 2.1 AA)
- Responsive design works on all breakpoints
- User flow is intuitive
- Interactive elements have proper states (hover, focus, active)

### 4. Teacher/Stakeholder
**Responsibilities:**
- Validate feature meets requirements
- Test from end-user perspective
- Verify content management workflow
- Acceptance testing
- Provide feedback on usability
- Final approval before deployment

**Acceptance Checklist:**
- Feature works as requested
- Content is editable through CMS
- Workflow is intuitive for content editors
- No bugs or unexpected behavior
- Meets school's needs
- Ready for production

## Development Workflow

### Phase 1: Feature Request / Task Definition
**Actor:** Teacher/Stakeholder (or Developer for technical tasks)

**Actions:**
1. Define the feature or bug fix needed
2. Provide context and requirements
3. Specify acceptance criteria
4. Note any design or technical constraints

**Output:** Clear task definition with acceptance criteria

---

### Phase 2: Design (if needed)
**Actor:** UX Designer

**Actions:**
1. Review task requirements
2. Design UI/UX if new components are needed
3. Ensure consistency with design system
4. Create design specifications
5. Consider accessibility requirements

**Output:** Design specifications, mockups (if needed), component guidelines

---

### Phase 3: Implementation
**Actor:** Developer

**Actions:**
1. Review task definition and design specs
2. Plan implementation approach
3. Implement feature following best practices
4. Write tests
5. Self-review code
6. Create documentation
7. Test locally
8. Submit for code review

**Deliverables:**
- Working implementation
- Tests (if applicable)
- Documentation updates
- Self-review completed

**Developer Checklist:**
- [ ] Feature implemented according to specifications
- [ ] Code follows project conventions
- [ ] Tests written and passing
- [ ] No console errors or warnings
- [ ] Responsive design implemented
- [ ] Accessibility attributes added
- [ ] Documentation updated
- [ ] Self-review completed

---

### Phase 4: Code Review
**Actor:** Staff Engineer

**Actions:**
1. Review code quality and architecture
2. Check for security issues
3. Validate best practices
4. Review test coverage
5. Check performance implications
6. Provide feedback or approval

**Review Outcomes:**
- **Approved:** Proceed to design review
- **Changes Requested:** Developer addresses feedback, returns to Phase 3
- **Rejected:** Return to planning with new approach

**Code Review Checklist:**
- [ ] Code is readable and maintainable
- [ ] Follows project architecture patterns
- [ ] No security vulnerabilities
- [ ] Proper error handling
- [ ] Performance is acceptable
- [ ] Tests cover main scenarios
- [ ] Documentation is clear
- [ ] No code smells or anti-patterns

---

### Phase 5: Design Review
**Actor:** UX Designer

**Actions:**
1. Review visual implementation
2. Check design system compliance
3. Verify accessibility
4. Test responsive design
5. Validate user experience
6. Provide feedback or approval

**Review Outcomes:**
- **Approved:** Proceed to acceptance testing
- **Changes Requested:** Developer addresses feedback, returns to Phase 3
- **Rejected:** Return to design phase with new specifications

**Design Review Checklist:**
- [ ] Matches design system (colors, typography, spacing)
- [ ] Visual consistency maintained
- [ ] Accessibility requirements met (ARIA labels, contrast, keyboard nav)
- [ ] Responsive on mobile, tablet, desktop
- [ ] Interactive elements have proper states
- [ ] Loading states handled gracefully
- [ ] Error states are user-friendly

---

### Phase 6: Acceptance Testing
**Actor:** Teacher/Stakeholder

**Actions:**
1. Test feature from end-user perspective
2. Verify against acceptance criteria
3. Test content management workflow
4. Check for any issues or gaps
5. Provide final approval or feedback

**Review Outcomes:**
- **Accepted:** Feature ready for deployment
- **Issues Found:** Developer addresses issues, returns to Phase 3
- **Rejected:** Return to requirements definition

**Acceptance Checklist:**
- [ ] Feature works as requested
- [ ] Meets all acceptance criteria
- [ ] Content management works intuitively
- [ ] No bugs or unexpected behavior
- [ ] Performance is acceptable
- [ ] Ready for production use

---

### Phase 7: Deployment
**Actor:** Developer (with Staff Engineer oversight)

**Actions:**
1. Deploy to staging environment
2. Verify on staging
3. Monitor for issues
4. Deploy to production (after approval)
5. Monitor production deployment
6. Document deployment

**Deployment Checklist:**
- [ ] Deployed to staging (dgkralupy.rjicha.online)
- [ ] Verified on staging environment
- [ ] Stakeholder reviewed on staging
- [ ] Approved for production
- [ ] Deployed to production (dgkralupy.cz)
- [ ] Monitoring confirms successful deployment
- [ ] Deployment documented

---

## How to Use This Workflow

### For the User (You)

When working with Claude, specify which persona you're acting as:

**Examples:**

```
As Teacher/Stakeholder: I need a feature to highlight important announcements on the homepage.
```

```
As Staff Engineer: Review the code for the navigation component. Check for performance issues.
```

```
As UX Designer: Review the button styles. They should match our design system.
```

```
As Teacher/Stakeholder: Test the article publishing workflow. Does it make sense?
```

### For Claude (Me)

When you assign me a persona or task, I will:

1. **As Developer:**
   - Implement features autonomously
   - Follow best practices
   - Write tests
   - Document changes
   - Use TodoWrite to track implementation tasks
   - Announce when ready for review

2. **As Staff Engineer:**
   - Review code thoroughly
   - Provide constructive feedback
   - Check for security and performance issues
   - Approve or request specific changes
   - Explain reasoning for feedback

3. **As UX Designer:**
   - Review visual implementation
   - Check design system compliance
   - Verify accessibility
   - Test responsive behavior
   - Provide specific design feedback

4. **As Teacher/Stakeholder:**
   - Test from end-user perspective
   - Focus on usability and requirements
   - Validate content management workflow
   - Provide acceptance approval or feedback

## Workflow States

Tasks move through these states:

1. **Defined** - Requirements clear, ready to start
2. **In Design** - UX Designer working on specifications
3. **In Development** - Developer implementing
4. **Code Review** - Staff Engineer reviewing
5. **Design Review** - UX Designer reviewing
6. **Acceptance Testing** - Stakeholder testing
7. **Ready for Staging** - Approved, ready to deploy to staging
8. **On Staging** - Deployed to dgkralupy.rjicha.online
9. **Ready for Production** - Approved on staging
10. **In Production** - Deployed to dgkralupy.cz
11. **Complete** - Done and verified

## Quick Start Examples

### Example 1: Simple Feature
```
User: As Teacher/Stakeholder: We need to add a "Back to Top" button on long pages.

Claude (as Developer): I'll implement this feature...
[implements feature]
Ready for code review.

User: As Staff Engineer: Review the implementation.

Claude (as Staff Engineer): [reviews code, provides feedback]

User: As UX Designer: Review the button design.

Claude (as UX Designer): [reviews design, checks accessibility]

User: As Teacher/Stakeholder: Test the feature.

Claude: [You test on staging and provide approval]

User: Deploy to production.

Claude (as Developer): [deploys to production]
```

### Example 2: Complex Feature with Iterations
```
User: As Teacher/Stakeholder: We need a calendar view for school events.

Claude (as Developer): This is a complex feature. Let me clarify requirements...
[asks clarifying questions]

User: As UX Designer: Here's what we need for the design...

Claude (as Developer): [implements feature]
Ready for code review.

User: As Staff Engineer: The performance needs improvement.

Claude (as Developer): [addresses feedback, optimizes]
Ready for re-review.

User: As Staff Engineer: Approved.

User: As UX Designer: The spacing doesn't match our design system.

Claude (as Developer): [fixes spacing issues]
Ready for design re-review.

User: As UX Designer: Approved.

User: As Teacher/Stakeholder: The date picker is confusing.

Claude (as Developer): [improves UX]
Ready for re-testing.

User: As Teacher/Stakeholder: Perfect! Deploy to staging.

Claude (as Developer): [deploys to staging]
```

## Benefits of This Workflow

1. **Clear Separation of Concerns** - Each persona focuses on their expertise
2. **Quality Gates** - Multiple review stages catch issues early
3. **Realistic Development Process** - Simulates real-world software development
4. **Autonomous Development** - Developer persona can work independently
5. **Comprehensive Review** - Technical, design, and user perspectives all covered
6. **Iterative Improvement** - Feedback loops at each stage
7. **Safe Deployment** - Staging environment before production

## Notes

- Not every task needs all phases. Simple bug fixes might skip design review.
- You can combine personas (e.g., "As Staff Engineer and UX Designer: Review this")
- Claude will use TodoWrite to track progress during development phases
- Claude will ask clarifying questions when requirements are unclear
- The workflow is flexible - adapt as needed for your project
