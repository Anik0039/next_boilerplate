import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LabeledValue } from "./labeled-value";

const meta = {
  title: "Shared/Molecules/LabeledValue",
  component: LabeledValue,
  args: { label: "Available balance", value: "BDT 12,450,000.00" },
} satisfies Meta<typeof LabeledValue>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
