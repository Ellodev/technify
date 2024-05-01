"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition, useCallback, useState } from "react";
import { Source } from "@/types/source.type";

type NewsFilterProps = {
	value: Source | undefined;
}

export default function NewsFilter({ value }: NewsFilterProps) {

	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const [source, setSource] = useState<Source>(value || "all");

	// localhost:3000/news?source=techcrunch

	const createQueryString = useCallback(
		(name: string, value: string) => {
			const params = new URLSearchParams(searchParams);
			params.set(name, value);
			return params.toString();
		},
		[searchParams],
	);

	const handleChange = (value: Source) => {
		setSource(value);

		startTransition(() => {
			router.replace(!value ? pathname : pathname + "?" + createQueryString("source", value));
		});
	}

	return (
		<form>
			<label>Choose your source:</label>

			<select id="source" name="source" className="dark:bg-black" value={source} onChange={(event) => handleChange(event.target.value as Source)}>
				<option value="all">All</option>
				<option value="techcrunch">TechCrunch</option>
				<option value="wired">Wired</option>
				<option value="theguardian">The Guardian</option>
				<option value="bbcnews">BBC News</option>
			</select>
		</form>
	)
}