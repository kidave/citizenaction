import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "./avatar";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./navigation-menu";
import { Separator } from "./separator";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import {
  TimelineItem,
  TimelineItemDate,
  TimelineItemDescription,
  TimelineItemTitle,
} from "./timeline";
import Timeline from "./timeline";
import { Button } from "./button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./carousel";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./resizable";
import { ScrollArea } from "./scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "./sidebar";

const meta = {
  title: "Layout",
  tags: ["!autodocs", "!manifest"],
  parameters: {
    layout: "padded",
  },
};

export default meta;

export const Avatars = {
  render: () => (
    <div className="space-y-5">
      <Avatar>
        <AvatarFallback>CA</AvatarFallback>
      </Avatar>
      <AvatarGroup>
        {["AK", "RM", "JS"].map((name) => (
          <Avatar key={name}>
            <AvatarFallback>{name}</AvatarFallback>
          </Avatar>
        ))}
        <AvatarGroupCount>+4</AvatarGroupCount>
      </AvatarGroup>
    </div>
  ),
};

export const BreadcrumbNavigation = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#home">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#governance">Governance</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Appointments</BreadcrumbPage>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <BreadcrumbEllipsis />
        </BreadcrumbSeparator>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

export const AccordionSections = {
  render: () => (
    <Accordion type="single" collapsible defaultValue="item-1" className="w-full max-w-lg">
      <AccordionItem value="item-1">
        <AccordionTrigger>How are proposals reviewed?</AccordionTrigger>
        <AccordionContent>
          Community members and relevant authorities review submitted proposals.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Can I update my response?</AccordionTrigger>
        <AccordionContent>
          You can edit your response while the consultation is open.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const CollapsibleExample = {
  render: () => (
    <Collapsible defaultOpen className="w-full max-w-sm space-y-2">
      <div className="flex items-center justify-between rounded-md border px-4 py-2">
        <span className="text-sm font-medium">Project details</span>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm">
            Toggle details
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="rounded-md border p-4 text-sm text-muted-foreground">
        This project is currently accepting public feedback.
      </CollapsibleContent>
    </Collapsible>
  ),
};

export const TabsNavigation = {
  render: () => (
    <Tabs defaultValue="overview" className="w-full max-w-lg">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="updates">Updates</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="rounded-md border p-4 text-sm">
        Overview content for the selected community project.
      </TabsContent>
      <TabsContent value="updates" className="rounded-md border p-4 text-sm">
        Recent project updates appear here.
      </TabsContent>
      <TabsContent value="documents" className="rounded-md border p-4 text-sm">
        Project documents appear here.
      </TabsContent>
    </Tabs>
  ),
};

export const DataTable = {
  render: () => (
    <Table>
      <TableCaption>Recent public consultations</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Consultation</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Responses</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Street safety plan</TableCell>
          <TableCell>Open</TableCell>
          <TableCell className="text-right">42</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Park improvements</TableCell>
          <TableCell>Review</TableCell>
          <TableCell className="text-right">18</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const HorizontalTimeline = {
  render: () => (
    <div className="h-64 w-full overflow-x-auto">
      <Timeline
        orientation="horizontal"
        alternating={false}
        horizItemWidth={220}
        horizItemSpacing={250}
      >
        {[
          ["Proposal submitted", "12 Mar 2025"],
          ["Community review", "20 Mar 2025"],
          ["Decision published", "4 Apr 2025"],
        ].map(([title, date]) => (
          <TimelineItem key={title}>
            <TimelineItemDate>{date}</TimelineItemDate>
            <TimelineItemTitle>{title}</TimelineItemTitle>
            <TimelineItemDescription>
              Project activity and community participation.
            </TimelineItemDescription>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  ),
};

export const ScrollableContent = {
  render: () => (
    <ScrollArea
      className="h-48 w-full max-w-sm rounded-md border p-4"
      viewportProps={{
        tabIndex: 0,
        "aria-label": "Recent community updates",
      }}
    >
      <div className="space-y-3">
        {Array.from({ length: 8 }, (_, index) => (
          <p key={index} className="text-sm">
            Update {index + 1}: Community feedback has been recorded for review.
          </p>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const ResizablePanels = {
  render: () => (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-48 w-full max-w-2xl rounded-lg border"
    >
      <ResizablePanel defaultSize={40} minSize={20}>
        <div className="flex h-full items-center justify-center p-4 text-sm">
          Proposal list
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={60} minSize={30}>
        <div className="flex h-full items-center justify-center p-4 text-sm">
          Proposal details
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const CarouselSlides = {
  render: () => (
    <Carousel className="w-full max-w-sm">
      <CarouselContent>
        {["Community", "Ideas", "Impact"].map((label) => (
          <CarouselItem key={label}>
            <div className="rounded-lg border bg-card p-10 text-center font-medium">
              {label}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious aria-label="Previous slide" />
      <CarouselNext aria-label="Next slide" />
    </Carousel>
  ),
};

export const NavigationMenuExample = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Explore</NavigationMenuTrigger>
          <NavigationMenuContent className="w-64 p-4">
            <NavigationMenuLink
              href="#proposals"
              className="block rounded-md p-2 text-sm hover:bg-accent"
            >
              Community proposals
            </NavigationMenuLink>
            <NavigationMenuLink
              href="#spaces"
              className="block rounded-md p-2 text-sm hover:bg-accent"
            >
              Local spaces
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export const SidebarNavigation = {
  render: () => (
    <SidebarProvider className="min-h-80 rounded-lg border">
      <Sidebar collapsible="none" className="relative min-h-80 border-r">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Governance</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>Organizations</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>Appointments</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <main className="p-6 text-sm">Select a governance directory.</main>
    </SidebarProvider>
  ),
};

export const Divider = {
  render: () => (
    <div className="w-full max-w-sm space-y-4">
      <p className="text-sm">Public project summary</p>
      <Separator />
      <p className="text-sm text-muted-foreground">Updated 15 April 2025</p>
      <div className="flex h-8 items-center gap-3">
        <span className="text-sm">Overview</span>
        <Separator orientation="vertical" />
        <span className="text-sm">Activity</span>
      </div>
    </div>
  ),
};
