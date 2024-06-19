import { atom, useAtom } from 'jotai';

import { Job, jobs } from '@/app/(dashboard)/dashboard/data';

type Config = {
  selected: Job["id"] | null
}

const configAtom = atom<Config>({
  selected: jobs[0].id,
})

export function useSelectedJob() {
  return useAtom(configAtom)
}
