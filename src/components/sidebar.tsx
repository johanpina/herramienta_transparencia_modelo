import { Button } from "@/components/ui/button"

interface SidebarProps {
  sections: { id: string; title: string }[]
  activeSection: string
  setActiveSection: (sectionId: string) => void
}

export function Sidebar({ sections, activeSection, setActiveSection }: SidebarProps) {
  return (
    <div className="w-64 bg-gray-800 text-white p-4">
      <h2 className="text-xl font-bold mb-4">Secciones</h2>
      <nav>
        {sections.map((section) => (
          <Button
            key={section.id}
            variant={activeSection === section.id ? "secondary" : "ghost"}
            className="w-full justify-start mb-2"
            onClick={() => setActiveSection(section.id)}
          >
            {section.title}
          </Button>
        ))}
      </nav>
    </div>
  )
}

