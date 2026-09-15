import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Heading } from "./heading";

const meta = {
  title: "Shared/Atoms/Heading",
  component: Heading,
  args: { children: "Account summary", level: 2 },
} satisfies Meta<typeof Heading>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
