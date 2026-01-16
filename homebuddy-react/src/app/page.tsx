import HomePage from "@/components/HomePage";

// Simulate slow loading
//TODO: Remove this before production
async function getData() {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return {};
}

export default async function Home() {
  //TODO: Fetch real data here
  //? Didn't happen, but might still be needed later
  /* await getData(); */

  return <HomePage />;
}