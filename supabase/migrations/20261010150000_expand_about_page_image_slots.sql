-- Expand editable About page image slots for the feature cards and storytelling section.
-- Keep legacy slot values valid for existing deployments.

alter table public.about_page_assets
  drop constraint if exists about_page_assets_slot_check;

alter table public.about_page_assets
  add constraint about_page_assets_slot_check
  check (
    slot in (
      'hero',
      'people',
      'places',
      'governance',
      'contributions',
      'timeline',
      'space',
      'story_people',
      'story_places',
      'story_progress'
    )
  );
