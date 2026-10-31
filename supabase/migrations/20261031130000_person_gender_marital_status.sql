-- Canonical demographic fields for public person profiles.
-- Gender is nullable: missing/unknown source values are not coerced to "other".
do $$
begin
  create type public.person_gender as enum ('male', 'female', 'other');
exception
  when duplicate_object then null;
end
$$;

alter table public.person
  add column if not exists gender public.person_gender,
  add column if not exists marital_status public.marital_status_enum;

comment on column public.person.gender is
  'Nullable application enum: male, female, or other. Unknown/unreported values remain NULL.';
comment on column public.person.marital_status is
  'Marital status normalized to the supported marital_status_enum values.';

update public.person
set gender = coalesce(
      gender,
      case lower(btrim(metadata->>'gender'))
        when 'male' then 'male'::public.person_gender
        when 'female' then 'female'::public.person_gender
        when 'other' then 'other'::public.person_gender
        else null
      end
    ),
    metadata = case
      when lower(btrim(metadata->>'gender')) in ('male', 'female', 'other')
        then metadata - 'gender'
      else metadata
    end
where metadata ? 'gender';

update public.person
set marital_status = case lower(btrim(metadata->>'marital_status'))
  when 'single' then 'single'::public.marital_status_enum
  when 'unmarried' then 'single'::public.marital_status_enum
  when 'never married' then 'single'::public.marital_status_enum
  when 'married' then 'married'::public.marital_status_enum
  when 'divorced' then 'divorced'::public.marital_status_enum
  when 'widowed' then 'widowed'::public.marital_status_enum
  when 'widow' then 'widowed'::public.marital_status_enum
  when 'widower' then 'widowed'::public.marital_status_enum
  when 'separated' then 'separated'::public.marital_status_enum
  else marital_status
end
where marital_status is null
  and nullif(btrim(metadata->>'marital_status'), '') is not null;
