export function financialInsightEngine({ ingresos, flujo, }: { ingresos: number; flujo: number; }) {
    if (ingresos === 0 || !isFinite(ingresos) || !isFinite(flujo)) {
        return {
            flujoRatio: 0,
            flujoPercentage: 0,
            riskLevel: "stable" as const,
            alerts: [],
        };
    }

    const absIngresos = Math.abs(ingresos);
    const absFlujo = Math.abs(flujo);
    const flujoRatio = absFlujo / absIngresos;
    const flujoPercentage = (flujo / ingresos) * 100;

    let riskLevel: "stable" | "warning" | "critical" = "stable";
    if (flujo < 0) {
        if (Math.abs(flujo) > ingresos * 0.5) {
            riskLevel = "critical";
        } else {
            riskLevel = "warning";
        }
    } else if (flujoPercentage < 10) {
        riskLevel = "warning";
    }

    const alerts: string[] = [];
    if (flujo < 0) {
        alerts.push(`Flujo negativo: ${flujoPercentage.toFixed(1)}% de los ingresos.`);
    }
    if (flujoPercentage < 20) {
        alerts.push("Margen de flujo bajo. Considere reducir gastos.");
    }
    if (absIngresos < 1000) {
        alerts.push("Ingresos muy bajos para análisis significativo.");
    }

    return {
        flujoRatio,
        flujoPercentage: Number(flujoPercentage.toFixed(1)),
        riskLevel,
        alerts,
    };
}