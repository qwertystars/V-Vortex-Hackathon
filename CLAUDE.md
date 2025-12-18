# Development Guidelines for Claude Code

This document outlines the recommended tools and workflows for development, debugging, and code reviews in this project.

## 🔧 Development Tools

### Codex Tool for Debugging and Code Reviews
**Always use the Codex tool for:**
- Debugging code issues and errors
- Performing comprehensive code reviews
- Analyzing code quality and suggesting improvements
- Troubleshooting complex logic problems

**Usage:**
- Use `mcp__codex__codex` for new debugging sessions
- Use `mcp__codex__codex-reply` for continuing existing conversations
- Configure with appropriate sandbox settings based on task requirements

### Playwright Tool for Testing
**Always use Playwright for:**
- End-to-end testing of web functionality
- Verifying user interfaces work as intended
- Testing user workflows and interactions
- Regression testing after code changes

**Key Playwright Functions:**
- `mcp__playwright__browser_navigate` - Navigate to pages
- `mcp__playwright__browser_snapshot` - Take accessibility snapshots
- `mcp__playwright__browser_click` - Interact with elements
- `mcp__playwright__browser_fill_form` - Test forms
- `mcp__playwright__browser_take_screenshot` - Capture visual states

### Supabase Tools for Database and Documentation
**Always use Supabase tools for:**
- Database schema management and migrations
- Documentation lookup and reference
- Applying database changes
- Managing Edge Functions
- Branch management for development

**Key Supabase Functions:**
- `mcp__supabase__search_docs` - Search Supabase documentation
- `mcp__supabase__apply_migration` - Apply database migrations
- `mcp__supabase__execute_sql` - Execute SQL queries
- `mcp__supabase__list_tables` - Explore database structure
- `mcp__supabase__get_advisors` - Check for security/performance issues

## 📋 Workflow Checklist

### Before Making Changes:
1. ✅ Use `mcp__supabase__search_docs` to review relevant documentation
2. ✅ Use Codex tool to analyze current implementation
3. ✅ Use Playwright to capture current state/baseline

### During Development:
1. ✅ Use Codex for real-time debugging and code review
2. ✅ Use Supabase tools for database-related changes
3. ✅ Test incrementally with Playwright

### After Changes:
1. ✅ Run comprehensive Playwright tests
2. ✅ Use Codex for final code review
3. ✅ Use `mcp__supabase__get_advisors` to check for issues
4. ✅ Verify all functionality works as expected

## 🚀 Best Practices

### Code Quality:
- Always run code reviews through Codex before committing
- Use Playwright to verify UI/UX changes
- Check Supabase advisors for performance and security recommendations

### Database Operations:
- Use `apply_migration` for DDL changes (not `execute_sql`)
- Always test database changes in a development branch first
- Document complex queries and migrations

### Testing:
- Create comprehensive Playwright tests for new features
- Test both happy paths and edge cases
- Verify responsive design and accessibility

### Documentation:
- Keep documentation updated alongside code changes
- Use Supabase docs as primary reference for database operations
- Document complex business logic and decisions

## 🔍 Troubleshooting

If you encounter issues:
1. Use Codex tool for code analysis and debugging
2. Check Supabase logs with `mcp__supabase__get_logs`
3. Use Playwright to reproduce UI issues
4. Search Supabase documentation for best practices
5. Run security and performance advisors

---

**Remember:** These tools are designed to work together synergistically. Using them consistently will improve code quality, catch issues early, and ensure robust functionality.