# Task 9: Fix all setup screens with consistent improvements

## Agent: screen-fixer

## Work Log:
- Added `screen-enter` animation class to root `<div>` in all 10 setup screens
- Added `useEffect` import and scroll-to-top on mount to 9 screens (OpeningScreen already had useEffect)
- Replaced hardcoded `totalSteps = 14` with `totalSteps = SCREEN_ORDER.length` in all 10 files
- Fixed invalid `flex-2` Tailwind class to `flex-[2]` in 9 files (OpeningScreen used `w-full` instead)

## Files Modified:
1. `src/components/game/ProfileScreen.tsx`
2. `src/components/game/CalendarScreen.tsx`
3. `src/components/game/ServicesScreen.tsx`
4. `src/components/game/RulesScreen.tsx`
5. `src/components/game/OpeningScreen.tsx`
6. `src/components/game/ClassroomsScreen.tsx`
7. `src/components/game/BathroomsCafeteriaScreen.tsx`
8. `src/components/game/TechnologyScreen.tsx`
9. `src/components/game/OfficeScreen.tsx`
10. `src/components/game/StudentsScreen.tsx`

## Stage Summary:
All setup screens now have consistent animations, scroll behavior, and responsive layout.
