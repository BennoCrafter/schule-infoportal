"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import DefaultLayout from "@/layouts/default";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

interface Substitution {
  class_name: string;
  period: string;
  absent_teacher: string;
  substitution_teacher: string;
  room: string;
  info: string;
  date: string;
}

export default function Substitutions() {
  const [substitutions, setSubstitutions] = useState<Substitution[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const username = searchParams.get("username");
    const password = searchParams.get("password");

    if (!username || !password) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/substitutions", {
          method: "GET",
          headers: {
            Authorization: `Basic ${btoa(`${username}:${password}`)}`,
          },
        });

        if (!response.ok) {
          console.error("Authentication failed");
          return;
        }

        const data = await response.json();

        setSubstitutions(data);
      } catch (err) {
        console.error("Error fetching substitutions:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  return (
    <DefaultLayout>
      <div className="w-full max-w-4xl mx-auto p-6">
        <Table>
          <TableCaption>Substitutions</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Class</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Absent Teacher</TableHead>
              <TableHead>Substitution Teacher</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Info</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {substitutions.map((sub, index) => (
              <TableRow key={index}>
                <TableCell>{sub.class_name}</TableCell>
                <TableCell>{sub.period}</TableCell>
                <TableCell>{sub.absent_teacher}</TableCell>
                <TableCell>{sub.substitution_teacher}</TableCell>
                <TableCell>{sub.room}</TableCell>
                <TableCell>{sub.info}</TableCell>
                <TableCell>{sub.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={7} className="text-right">
                Last updated:{" "}
                {lastUpdated ? lastUpdated.toLocaleString() : "N/A"}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
        {isLoading && (
          <div className="flex justify-center items-center">
            <Spinner key="circle-filled" variant="circle-filled" />
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}
