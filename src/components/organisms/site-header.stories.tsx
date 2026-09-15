import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SiteHeader } from "./site-header";

const meta = {
  title: "Shared/Organisms/SiteHeader",
  component: SiteHeader,
} satisfies Meta<typeof SiteHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
