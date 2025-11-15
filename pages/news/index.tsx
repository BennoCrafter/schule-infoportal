import React, { useState, useEffect } from "react";
import { useSearchParams, redirect } from "next/navigation";
import { Film, Music } from "lucide-react";
import { button as buttonStyles } from "@heroui/theme";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { title } from "@/components/primitives";
import WrongPage from "@/pages/wrong_page";
import DefaultLayout from "@/layouts/default";

export default function News() {
  return (
    <DefaultLayout>
      <div>
        <h1>News</h1>
      </div>
    </DefaultLayout>
  );
}
