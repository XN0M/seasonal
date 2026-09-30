# Implemented layout reference

These describe the built preview, not a separate approved Figma deliverable. Compare with the screenshots in `docs/qa/`.

## Homepage

```text
Desktop                                 Mobile
Disclosure                              Disclosure
Logo / navigation / market / finder     Logo / market / menu
Headline + 2 CTAs | seasonal collage     Headline / copy / 2 CTAs
Quick recipient finder                  Compact seasonal collage
Phase rail                              Quick recipient choices
Editorial concept grid (4 columns)      Horizontally scrollable phase rail
Women story + product grid              Concept grid (2 columns)
Family story + product grid             Women / family edits
Budget shortcuts                        Budget shortcuts
Upcoming event links                    Upcoming event links
Guides / selection criteria / FAQ       Guides / criteria / FAQ
Policy footer                           Policy footer
```

The first viewport includes a gift collage and a Gift Finder CTA. Preview product art is generic; the 60/40 real product/lifestyle target cannot be assessed until merchant imagery exists. Keep hero sizing and the compact section rhythm when replacing it.

## Event hub

```text
Localised event hero / preselected Gift Finder CTA / jump to picks
Current shopping phase | market-specific date
Budget shortcuts → filtered Finder with event preserved
Disclosure / event-specific concept grid
Unverified shipping notice (never a invented delivery cutoff)
FAQ / policy footer
```

Full interactive category/recipient rails and comparisons should be completed with the real catalog. The current budget shortcuts are shareable links, not a fake offer filter.

## Gift Finder

```text
Desktop: filters column | results column
Mobile:  filters → results

01 Recipient
02 Interest
03 Budget in the chosen market currency
04 Event
05 Market

Verified offer count / reset
Eligible products OR useful no-result message
Separate disclosure + expandable preview concepts
```

Selection survives URL sharing and browser history. Invalid URL values fall back safely. The real result set currently contains zero offers; preview concepts are not disguised as available products.
