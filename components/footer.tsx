import { GithubIcon, MailIcon } from "lucide-react"
import Image from "next/image"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="py-8 border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                  <Image
                    src="/pitta-gpt.ico"
                    alt="SingBirds Logo"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
              <h3 className="text-xl font-bold gradient-text">SingBirds</h3>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-left">
              I Code Birds.
            </p>
          </div>

          <div className="flex gap-4">
            <a
              href="https://github.com/fairy-pitta"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-sky-500 transition-colors"
              aria-label="GitHub"
            >
              <GithubIcon className="h-6 w-6" />
            </a>
          </div>
        </div>

        <div className="border-t mt-6 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">&copy; {currentYear} SingBirds. All rights reserved.</div>

          <div className="flex gap-6 text-sm">
            <a href="/privacy" className="text-muted-foreground hover:text-sky-500 transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="text-muted-foreground hover:text-sky-500 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
