import { Button } from '@/shared/frontend/ui-shadcn/components/ui/button';

export default function Index() {
  /*
   * Replace the elements below with your own.
   *
   * Note: The corresponding styles are in the ./index.css file.
   */
  return (
    <div className="h-screen w-full flex items-center justify-center ">
      <h1 className="text-black text-6xl">Hello Steven</h1>
      <Button variant={'destructive'}>Sample button</Button>
    </div>
  );
}
