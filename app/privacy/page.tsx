import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Privacy Policy | SingBirds",
  description: "Privacy policy for SingBirds website",
}

export default function PrivacyPolicy() {
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

            <h1 className="text-3xl md:text-4xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-muted-foreground mb-8">Last updated: April 2023</p>

            <div className="prose prose-sky max-w-none">
              <h2>Introduction</h2>
              <p>
                At SingBirds, we respect your privacy and are committed to protecting your personal data. This privacy
                policy will inform you about how we look after your personal data when you visit our website and tell
                you about your privacy rights and how the law protects you.
              </p>

              <h2>The Data We Collect</h2>
              <p>
                We may collect, use, store and transfer different kinds of personal data about you which we have grouped
                together as follows:
              </p>
              <ul>
                <li>
                  <strong>Identity Data</strong> includes first name, last name, username or similar identifier.
                </li>
                <li>
                  <strong>Contact Data</strong> includes email address and telephone numbers.
                </li>
                <li>
                  <strong>Technical Data</strong> includes internet protocol (IP) address, browser type and version,
                  time zone setting and location, browser plug-in types and versions, operating system and platform, and
                  other technology on the devices you use to access this website.
                </li>
                <li>
                  <strong>Usage Data</strong> includes information about how you use our website and services.
                </li>
              </ul>

              <h2>How We Use Your Data</h2>
              <p>
                We will only use your personal data when the law allows us to. Most commonly, we will use your personal
                data in the following circumstances:
              </p>
              <ul>
                <li>To register you as a new customer or user.</li>
                <li>
                  To deliver relevant website content and advertisements to you and measure or understand the
                  effectiveness of the advertising we serve to you.
                </li>
                <li>
                  To use data analytics to improve our website, products/services, marketing, customer relationships and
                  experiences.
                </li>
              </ul>

              <h2>Newsletter Subscriptions</h2>
              <p>
                If you choose to subscribe to our newsletter, we will use your email address to send you updates about
                our services, new blog posts, and other relevant information. You can unsubscribe from these
                communications at any time by clicking the "unsubscribe" link in the emails or by contacting us
                directly.
              </p>

              <h2>Cookies</h2>
              <p>
                We use cookies and similar tracking technologies to track the activity on our website and hold certain
                information. Cookies are files with a small amount of data which may include an anonymous unique
                identifier.
              </p>

              <h2>Data Security</h2>
              <p>
                We have put in place appropriate security measures to prevent your personal data from being accidentally
                lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to
                your personal data to those employees, agents, contractors and other third parties who have a business
                need to know.
              </p>

              <h2>Your Legal Rights</h2>
              <p>
                Under certain circumstances, you have rights under data protection laws in relation to your personal
                data, including the right to:
              </p>
              <ul>
                <li>Request access to your personal data.</li>
                <li>Request correction of your personal data.</li>
                <li>Request erasure of your personal data.</li>
                <li>Object to processing of your personal data.</li>
                <li>Request restriction of processing your personal data.</li>
                <li>Request transfer of your personal data.</li>
                <li>Right to withdraw consent.</li>
              </ul>

              <h2>Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
                Privacy Policy on this page and updating the "last updated" date at the top of this Privacy Policy.
              </p>

              <h2>Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at{" "}
                <a href="mailto:momotus.lessonii@gmail.com">momotus.lessonii@gmail.com</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
