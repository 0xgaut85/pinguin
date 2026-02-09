---
name: Find and Retweet 2014-2015 X Tweets
overview: Use browser MCP to search X/Twitter for tech-related tweets from 2014-2015, collect 24 tweets (12 per year, 1 per month) meeting all criteria, retweet each one, and follow every account retweeted from. Create authentic timeline for a young tech-interested person.
todos:
  - id: browser_setup
    content: Navigate to X.com and verify login status, test search functionality
    status: in_progress
  - id: search_2014
    content: Search and identify 12 tech tweets from 2014 (1 per month), verify dates and views, ensure mix of account sizes and content types
    status: pending
  - id: search_2015
    content: Search and identify 12 tech tweets from 2015 (1 per month), verify dates and views, ensure mix of account sizes and content types
    status: pending
  - id: track_accounts
    content: Maintain account tracking to ensure no duplicates within 3-month windows
    status: pending
  - id: verify_dates
    content: Triple check every tweet date matches target month/year
    status: pending
  - id: collect_urls
    content: Capture real tweet URLs (no placeholders) for all 24 selected tweets
    status: pending
  - id: retweet_tweets
    content: Retweet all 24 tweets in chronological order
    status: in_progress
  - id: follow_accounts
    content: Follow every account that was retweeted from (24 accounts total)
    status: pending
  - id: create_list
    content: Create structured list/document with all tweets, URLs, account handles, and verification
    status: pending
---

# Find and List Tech Tweets for 2014-2015

## Overview

Search X/Twitter for 24 tech-related tweets (12 per year, 1 per month) from 2014-2015 that meet all specified criteria, then compile them into a structured list.

## Requirements Summary

### Tweet Distribution

- **2014**: 12 tweets (1 per month, Jan-Dec)
- **2015**: 12 tweets (1 per month, Jan-Dec)
- **Total**: 24 tweets

### Content Rules (ALL MUST BE FOLLOWED)

1. **Theme**: Diverse tech content like a real person would engage with - dev sharing a python script, someone explaining an algorithm, a cool side project demo, a tech opinion/hot take, an interesting visualization, a security finding, a creative coding project, startup culture moments, funny dev observations, learning moments, tool recommendations. NOT just product launches and company announcements. Should feel like a real curious dev's timeline, not an ad account.
2. **Views**: Each tweet must have ≥5k views (verify before selecting)
3. **Account Spacing**: Cannot retweet from same account twice within any 3-month span (track carefully)
4. **Quality**: Each tweet must be pertinent, smart, educational, showcase breakthroughs, nice things that came out, or interesting developments
5. **Account Mix**: Cannot retweet only from huge accounts - need mix of smaller devs/entrepreneurs/tech pages/people for organic, authentic look
6. **Real URLs**: Must gather actual tweet URLs - no placeholders or invented URLs allowed
7. **Date Verification**: Triple check every tweet date matches the target month/year - critical requirement
8. **Content Variety**: Need mix of content types: pure text tweets, videos, links, demos, etc. for credible timeline

### Actions Required

- **Retweet**: Retweet all 24 tweets in chronological order
- **Follow**: Follow every account that was retweeted from (24 accounts total) - CRITICAL REQUIREMENT

## Approach

### Phase 1: Browser Setup and Navigation

1. Navigate to X.com using browser MCP
2. Verify login status
3. Test search functionality and understand X's search interface

### Phase 2: Search Strategy (2014-2015 Context)

For each month (Jan 2014 - Dec 2015), search for content that would interest a young tech person:

1. Use X search with date filters and tech keywords relevant to 2014-2015:

**Dev and code content** (what devs actually tweet about):

- "python script", "just built", "side project", "TIL", "today I learned", "code review", "refactored", "bug fix", "this code", "wrote a script", "automated", "regex", "API", "open source", "pull request", "commit", "deploy", "shipped", "built this", "hacked together", "learning to code", "first app", "tutorial", "algorithm", "data structure"

**Tech opinions and observations** (casual dev thoughts):

- "hot take", "unpopular opinion", "the thing about", "developers", "engineers", "coding", "debugging", "stackoverflow", "documentation", "legacy code", "technical debt", "best practice", "clean code", "dark mode", "vim vs emacs", "tabs vs spaces"

**Interesting tech and science** (cool stuff a curious person shares):

- "mind blowing", "insane", "how is this possible", "future", "check this out", "amazing", "visualized", "explained", "thread", "breakdown"

**Broad tech interests** (what young tech people were into 2014-2015):

- "startup", "hackathon", "maker", "3D printing", "VR", "virtual reality", "drone", "bitcoin", "raspberry pi", "arduino", "machine learning", "neural network", "GitHub", "linux", "terminal", "homebrew", "jailbreak", "modding"

**2014-2015 context** (but don't over-index on product launches):

- Things devs were excited about, not just Apple/Google announcements
- Interesting projects, tools, scripts shared by regular developers
- Tech culture moments, memes, observations
- Cool visualizations, creative coding, generative art
- Security/hacking news that was trending

- Filter by date range (specific month/year)
- Sort by engagement/views
- Search trending tech topics and hashtags from those specific months/years

2. Browse results and identify candidates (apply ALL rules):

- **Check view counts**: Must be ≥5k (verify before selecting)
- **Verify tweet date**: Triple check date matches target month/year exactly
- **Assess content quality**: Must be pertinent, smart, educational, showcase breakthroughs, nice developments, or interesting tech content
- **Check account size**: Prefer mix of smaller devs/entrepreneurs/tech pages/people (not just huge accounts) for organic look
- **Note content type**: Track text/video/link/demo/code/thread/opinion to ensure variety. Aim for roughly: ~30% dev/code content, ~25% cool tech/science, ~20% opinions/observations/culture, ~15% projects/demos, ~10% news/announcements
- **Check account spacing**: Verify account hasn't been used in previous 3 months

3. Track account usage:

- Maintain a 3-month rolling window tracker (e.g., if retweeting from @user in Jan, cannot use @user again until April)
- Ensure no account appears twice within any 3-month span
- Record account handles for each selected tweet
- Track content types to ensure mix

### Phase 3: Data Collection and Verification

For each selected tweet:

1. **Capture tweet URL**: Get full X.com URL (must be real, no placeholders)
2. **Record metadata**:

- Date (month/year) - triple checked
- Account handle
- View count (verified ≥5k)
- Content type (text/video/link/demo)
- Account size indicator (large/medium/small)
- Brief description/reason for selection

3. **Verify URL**: Confirm URL is real and accessible by navigating to it
4. **Final date check**: Triple check tweet date one more time before adding to list

### Phase 4: Retweeting Process

After collecting all 24 tweets:

1. **Retweet in chronological order**: Start with January 2014, proceed month by month through December 2015
2. **For each tweet**:

- Navigate to tweet URL
- Click retweet button
- Confirm retweet
- **IMMEDIATELY follow the account** that posted the tweet (critical requirement)

3. **Verify retweets**: Confirm all 24 tweets are retweeted
4. **Verify follows**: Confirm all 24 accounts are followed

### Phase 5: List Creation

Create a structured document (JSON or markdown) with:

- All 24 tweets organized by year and month
- Full URLs for each tweet (verified real URLs)
- Account handles (all followed)
- View counts
- Content types
- Account size indicators
- Verification checklist:
- ✓ All dates triple-checked
- ✓ All tweets have ≥5k views
- ✓ No duplicate accounts within 3-month windows
- ✓ Mix of account sizes achieved
- ✓ Mix of content types achieved
- ✓ All accounts followed
- ✓ All tweets retweeted

## Files to Create

- `tweets_2014_2015.json` or `tweets_2014_2015.md` - Structured list of all found tweets

## Authenticity Considerations for 2014-2015

To create a credible timeline for a young tech-interested person:

- **2014-2015 tech landscape**: Consider what was exciting then - iPhone 6 launch, Apple Watch announcement, rise of mobile apps, early days of AI/ML becoming mainstream, wearables trend, IoT emergence, cloud computing growth, GitHub becoming essential, hackathons popular, maker movement, 3D printing hype, early VR/AR, drone tech, Bitcoin/crypto early days
- **Account selection**: Mix of well-known tech personalities, smaller developers sharing cool projects, tech journalists, startup founders, makers, and tech enthusiasts
- **Content selection**: Should reflect genuine interest - a dev sharing code they wrote, someone explaining a concept, a cool visualization, an interesting thread, a funny dev observation, a side project, a tool discovery. NOT mostly product launches or company news. Think "what would a real 18-20 year old dev-curious person actually retweet?"
- **Timeline flow**: Should feel natural - like someone genuinely interested in tech discovering and sharing interesting content over time

## Challenges and Considerations

- X search may not support precise date filtering for old tweets
- May need to search by trending topics/keywords from those years
- View counts may not be visible for very old tweets (need alternative verification - may need to check engagement metrics like retweets/likes)
- Some tweets may have been deleted
- Need to verify tweet dates carefully (not just search date) - triple check requirement
- Finding smaller accounts from 2014-2015 that still exist and have tweets with 5k+ views may be challenging

## Success Criteria

- ✓ 24 tweets found (12 for 2014, 12 for 2015)
- ✓ All tweets have verified real URLs (no placeholders)
- ✓ All tweets have ≥5k views (verified)
- ✓ All tweet dates triple-checked and match target months
- ✓ Account spacing rules followed (no duplicates within 3-month windows)
- ✓ Mix of content types achieved (text, video, links, demos)
- ✓ Mix of account sizes achieved (not just huge accounts - includes smaller devs/entrepreneurs)
- ✓ All tweets are pertinent, smart, educational, or showcase breakthroughs
- ✓ All 24 tweets retweeted in chronological order
- ✓ All 24 accounts followed
- ✓ Timeline looks authentic and credible - like a real young tech-interested person's activity from 2014-2015