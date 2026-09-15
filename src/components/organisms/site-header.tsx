import { Heading, Text } from "@/components/atoms";

export function SiteHeader() {
  return (
    <header className="border-b border-blue-950 bg-blue-950 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div>
          <Heading level={1} className="text-xl">
            Corporate Internet Banking
          </Heading>
          <Text className="text-blue-100">Frontend architecture reference</Text>
        </div>
        <span className="rounded-full border border-blue-300/40 px-3 py-1 text-xs">
          Prototype
        </span>
      </div>
    </header>
  );
}
