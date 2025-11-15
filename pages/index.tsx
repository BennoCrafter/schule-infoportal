import { button as buttonStyles } from "@heroui/theme";
import { Link } from "@heroui/link";

import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function IndexPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-6 py-8 md:py-10">
        <div className="flex flex-col items-center">
          <h1 className={title()}>schule-infoportal</h1>
          <Link href="/substitutions" className={buttonStyles()}>
            Get Started
          </Link>
        </div>
      </section>
    </DefaultLayout>
  );
}
