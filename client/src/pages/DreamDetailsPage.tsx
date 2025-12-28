import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DreamsApi } from "@/lib/api/dreams";
import { useTranslation } from "react-i18next";
import React from "react";
export default function DreamDetailsPage() {
    const { t, i18n } = useTranslation();
    const { id } = useParams<{
        id: string;
    }>();
    const { data, isLoading, error } = useQuery({
        queryKey: ["dream", id],
        queryFn: () => DreamsApi.getById(id!),
        enabled: !!id,
    });
    React.useEffect(() => {
        if (id) {
            DreamsApi.recordActivity?.(id, "view").catch(() => {});
        }
    }, [id]);
    if (isLoading)
        return <div className="p-8">{t("common.loading")}</div>;
    if (error || !data)
        return <div className="p-8">{t("common.notFound")}</div>;
    return (<div className="max-w-3xl mx-auto p-6 glass-card rounded-2xl" dir={i18n.dir()}>
      <h1 className="text-3xl font-bold mb-4">{data.title}</h1>
      <h3 className="text-xl font-semibold mb-2">{t("dreamDetails.dream")}</h3>
      <p className="mb-6 text-purple-100">{data.userInput}</p>
      <h3 className="text-xl font-semibold mb-2 text-amber-300">{t("dreamDetails.interpretation")}</h3>
      <p className="text-purple-50 whitespace-pre-line">{data.aiResponse}</p>
    </div>);
}
