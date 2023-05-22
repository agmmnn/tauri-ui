import { Button } from "@/components/ui/button"

export function ButtonAsChild() {
  return (
    <Button>
      {/*asChild*/}
      <a href="/login">Login</a>
    </Button>
  )
}
