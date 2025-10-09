import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Terms of Service | SingBirds",
  description: "Terms of service for SingBirds website",
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <div className="pt-16 md:pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <Button variant="ghost" className="mb-6" asChild>
              <Link href="/">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>

            <h1 className="text-3xl md:text-4xl font-bold mb-6">Terms of Service</h1>
            <p className="text-muted-foreground mb-8">Last updated: April 2023</p>

            <div className="prose prose-sky max-w-none">
              <h2>Introduction</h2>
              <p>
                Welcome to SingBirds. These terms and conditions outline the rules and regulations for the use of our
                website. By accessing this website, we assume you accept these terms and conditions in full. Do not
                continue to use SingBirds's website if you do not accept all of the terms and conditions stated on this
                page.
              </p>

              <h2>Intellectual Property Rights</h2>
              <p>
                Unless otherwise stated, SingBirds and/or its licensors own the intellectual property rights for all
                material on SingBirds. All intellectual property rights are reserved. You may view and/or print pages
                from the website for your own personal use subject to restrictions set in these terms and conditions.
              </p>

              <p>You must not:</p>
              <ul>
                <li>Republish material from this website</li>
                <li>Sell, rent or sub-license material from the website</li>
                <li>Reproduce, duplicate or copy material from the website</li>
                <li>Redistribute content from SingBirds (unless content is specifically made for redistribution)</li>
              </ul>

              <h2>User Content</h2>
              <p>
                In these terms and conditions, "User Content" shall mean any audio, video, text, images or other
                material you choose to display on this website. By displaying your User Content, you grant SingBirds a
                non-exclusive, worldwide, irrevocable, royalty-free, sublicensable license to use, reproduce, adapt,
                publish, translate and distribute it in any and all media.
              </p>

              <p>
                Your User Content must be your own and must not be infringing on any third party's rights. SingBirds
                reserves the right to remove any of your content from this website at any time without notice.
              </p>

              <h2>No Warranties</h2>
              <p>
                This website is provided "as is," with all faults, and SingBirds makes no express or implied
                representations or warranties, of any kind related to this website or the materials contained on this
                website.
              </p>

              <h2>Limitation of Liability</h2>
              <p>
                In no event shall SingBirds, nor any of its officers, directors and employees, be liable to you for
                anything arising out of or in any way connected with your use of this website, whether such liability is
                under contract, tort or otherwise, and SingBirds, including its officers, directors and employees shall
                not be liable for any indirect, consequential or special liability arising out of or in any way related
                to your use of this website.
              </p>

              <h2>Indemnification</h2>
              <p>
                You hereby indemnify to the fullest extent SingBirds from and against any and all liabilities, costs,
                demands, causes of action, damages and expenses (including reasonable attorney's fees) arising out of or
                in any way related to your breach of any of the provisions of these terms.
              </p>

              <h2>Severability</h2>
              <p>
                If any provision of these terms is found to be unenforceable or invalid under any applicable law, such
                unenforceability or invalidity shall not render these terms unenforceable or invalid as a whole, and
                such provisions shall be deleted without affecting the remaining provisions herein.
              </p>

              <h2>Variation of Terms</h2>
              <p>
                SingBirds is permitted to revise these terms at any time as it sees fit, and by using this website you
                are expected to review such terms on a regular basis to ensure you understand all terms and conditions
                governing use of this website.
              </p>

              <h2>Governing Law & Jurisdiction</h2>
              <p>
                These terms will be governed by and construed in accordance with the laws of the jurisdiction in which
                SingBirds operates, and you submit to the non-exclusive jurisdiction of the courts located in that
                jurisdiction for the resolution of any disputes.
              </p>

              <h2>Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at{" "}
                <a href="mailto:momotus.lessonii@gmail.com">momotus.lessonii@gmail.com</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
