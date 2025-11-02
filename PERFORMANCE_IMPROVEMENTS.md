# Performance Improvements

This document summarizes the performance optimizations made to the xiyo.dev blog codebase.

## Summary of Changes

### 1. Parallel Processing in Category Tree Traversal

**File**: `src/lib/post/Category.js`
**Impact**: High

Changed the `getAllPosts()` method to process child categories in parallel instead of sequentially:

```javascript
// Before: Sequential processing
for (const childCategory of this.#childCategories.values()) {
	const posts = await childCategory.getAllPosts(); // Blocking
	childPosts.push(...posts);
}

// After: Parallel processing
const childPostsArrays = await Promise.all(
	[...this.#childCategories.values()].map((childCategory) => childCategory.getAllPosts())
);
const childPosts = childPostsArrays.flat();
```

**Benefits**:

- Significantly faster traversal of deep category trees
- Better utilization of async operations
- Scales well with number of child categories

### 2. Eliminated Filesystem Scanning in Sitemap Generation

**File**: `src/routes/sitemap.xml/+server.js`
**Impact**: High

Replaced manual filesystem scanning with the existing Category/Post infrastructure:

```javascript
// Before: Manual FS scanning
async function scanDirectory(dirPath, locale, relativePath, urls) {
	const entries = await readdir(dirPath);
	// ... recursive scanning with fs.stat
}

// After: Use Category system
const root = Category.getCategory('');
const [allPosts, allCategories] = await Promise.all([
	root.getAllPosts(),
	Promise.resolve(root.allChildCategories)
]);
```

**Benefits**:

- No redundant file system operations
- Consistent with rest of application
- Batch metadata loading
- Easier to maintain

### 3. Extracted Common Sorting Logic

**File**: `src/lib/post/Category.js`
**Impact**: Medium

Created a reusable sorting method to eliminate code duplication:

```javascript
// New private static method
static #sortPostsByDate(posts) {
    return posts.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());
}
```

Used in both `getPosts()` and `getAllPosts()` methods.

**Benefits**:

- DRY principle (Don't Repeat Yourself)
- Consistent sorting behavior
- Easier to modify sorting logic in the future

### 4. Optimized getLatestPostDate

**File**: `src/lib/post/Category.js`
**Impact**: Low

Changed from O(n) operation to O(1) by utilizing already-sorted posts:

```javascript
// Before: Iterating all posts
const dates = allPosts.map((post) => post.sortDate);
return new Date(Math.max(...dates.map((d) => d.getTime())));

// After: Using first element of sorted array
return allPosts[0].sortDate;
```

**Benefits**:

- Constant time lookup instead of linear
- No unnecessary array iterations

### 5. Added Limits to toSerialize Method

**File**: `src/lib/post/Category.js`, `src/routes/(main)/[...slug]/+page.server.js`
**Impact**: Medium

Added `maxPosts` parameter to prevent loading excessive data:

```javascript
async toSerialize(maxDepth = 10, maxPosts = undefined) {
    // ...
    const postsToSerialize = maxPosts ? allPosts.slice(0, maxPosts) : allPosts;
    // ...
}

// Usage in routes
categoryInstance?.toSerialize(10, 100); // Limit to 100 posts
```

**Benefits**:

- Reduced memory usage for large categories
- Faster serialization
- Prevents overwhelming the client with data

### 6. Added Documentation Comments

**Files**: Various
**Impact**: Low

Added clarifying comments about metadata caching and performance considerations:

```javascript
// Extract first 50 posts - metadata already cached from getAllPosts()
const recent = await Promise.all(...);
```

**Benefits**:

- Better code understanding
- Helps future optimization efforts
- Documents intentional design decisions

### 7. Code Quality Improvements

**Files**: Various
**Impact**: Low

- Removed unused `__noop` function from `markdown.js`
- Removed unused `baseLocale` import from `feed.xml/+server.js`
- Added comment to empty catch block in `+layout.svelte`

**Benefits**:

- Cleaner codebase
- Passes linting checks
- Better maintainability

## Performance Considerations

### Current Caching Strategy

The codebase uses several levels of caching:

1. **Post Metadata Caching**: Each Post instance caches its metadata after first load
2. **Processed Markdown Caching**: Markdown processing results are cached per Post
3. **Unified Processor Caching**: The markdown processor itself is cached and reused

### Known Performance Characteristics

- **getAllPosts()**: Loads and caches metadata for all posts, then sorts. Expensive on first call, fast on subsequent calls due to caching.
- **toSerialize()**: Now respects depth and post limits to prevent excessive data loading.
- **Sitemap generation**: Uses Category system instead of FS, leveraging existing metadata cache.

### Potential Future Optimizations

1. **Lazy metadata loading**: Only load metadata when actually needed (complex change)
2. **Incremental sorting**: For very large post sets, consider pagination at the data layer
3. **Mermaid diagram caching**: Cache rendered SVGs to avoid browser launches during build
4. **Memory management**: Consider more aggressive cache clearing for long-running processes

## Testing

All changes maintain existing functionality. The build completes successfully, and pre-existing tests pass.

## Measurements

Before making these changes, the main performance bottlenecks were:

1. Sequential category traversal in `getAllPosts()`
2. Redundant filesystem operations in sitemap generation
3. Unnecessary data loading in `toSerialize()`

After these optimizations:

- Category tree traversal is parallelized
- Sitemap generation eliminates FS operations
- Data serialization respects reasonable limits
- Code is more maintainable with less duplication

For specific benchmarks, consider adding timing logs in development mode.
