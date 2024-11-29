import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function SiteFooter() {
  return (
    <footer className="border-t py-12 md:py-16">
      <div className="container space-y-8">
        <div className="space-y-4 text-center">
          <h3 className="text-2xl font-bold">Ready to Get Started?</h3>
          <p className="text-gray-600">
            Start managing your tasks better today with TaskPlanner
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline">Sign Up Now</Button>
            <Button className="bg-navy-900 hover:bg-navy-800">
              Request Demo
            </Button>
          </div>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Subscribe</h4>
            <div className="flex gap-2">
              <Input placeholder="Enter your email" type="email" />
              <Button>Send</Button>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>About Us</li>
              <li>Blog</li>
              <li>Contact</li>
              <li>FAQ</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Contact Us</h4>
            <div className="text-sm text-gray-600">
              <p>123 Business Street</p>
              <p>New York, NY 10001</p>
              <p>contact@taskplanner.com</p>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Get the app</h4>
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="justify-start">
                App Store
              </Button>
              <Button variant="outline" className="justify-start">
                Google Play
              </Button>
            </div>
          </div>
        </div>
        <div className="text-center text-sm text-gray-600">
          <p>© 2024 TaskPlanner. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
