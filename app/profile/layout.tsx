import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProfileSidebar } from "@/components/profile/profile-sidebar"
import { Breadcrumb } from "@/components/breadcrumb"

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <Breadcrumb
            items={[
              { label: "หน้าแรก", href: "/" },
              { label: "บัญชีของฉัน", href: "/profile" },
            ]}
          />
          <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
            <ProfileSidebar />
            <div>{children}</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
