import type { Game } from "./types";
import type { Locale } from "./i18n";

/** Mirrors worker/model.mjs CONFIG.HOME_ADV_ELO. */
const HOME_ADV_ELO = 55;

/**
 * Turn a prediction back into the handful of numbers that produced it.
 *
 * This replaces a pair of hardcoded sentences ("clear home-court advantage and
 * stable recent form") that were shown for every game regardless of the teams —
 * and which referred to player form the model has never had access to.
 */
export function explainPrediction(game: Game, locale: Locale): string[] {
  const lines: string[] = [];
  const zh = locale === "zh";

  const homeElo = game.home_elo;
  const awayElo = game.away_elo;

  if (homeElo != null && awayElo != null) {
    const gap = Math.round(homeElo - awayElo);
    const homeName = zh ? game.home_team_cn ?? game.home_abbr : game.home_abbr;
    const awayName = zh ? game.away_team_cn ?? game.away_abbr : game.away_abbr;

    lines.push(
      zh
        ? `评分：${homeName} ${Math.round(homeElo)} 对 ${awayName} ${Math.round(awayElo)}，相差 ${gap > 0 ? "+" : ""}${gap} 分。`
        : `Ratings: ${homeName} ${Math.round(homeElo)} vs ${awayName} ${Math.round(awayElo)}, a gap of ${gap > 0 ? "+" : ""}${gap}.`
    );

    const effective = gap + HOME_ADV_ELO;
    lines.push(
      zh
        ? `加上主场优势 ${HOME_ADV_ELO} 分，有效差 ${effective > 0 ? "+" : ""}${effective} 分，折合约 ${Math.abs(effective / 22).toFixed(1)} 分净胜。`
        : `Home court adds ${HOME_ADV_ELO}, giving an effective gap of ${effective > 0 ? "+" : ""}${effective} — about ${Math.abs(effective / 22).toFixed(1)} points of margin.`
    );
  }

  if (game.predicted_total != null) {
    lines.push(
      zh
        ? `预测总分 ${game.predicted_total.toFixed(1)}，由双方场均得分与失分推算，赛季初向联盟均值回归。`
        : `A projected total of ${game.predicted_total.toFixed(1)}, from both teams' scoring rates, regressed toward the league average early in the season.`
    );
  }

  const blended = game.model_version?.includes("market");
  lines.push(
    blended
      ? zh
        ? "该预测已与博彩盘口按各 50% 混合。"
        : "This prediction is blended 50/50 with the bookmaker line."
      : zh
        ? "暂无赔率数据，本次为纯模型输出。模型不掌握伤病与出场信息。"
        : "No odds available, so this is pure model output. The model has no injury or availability data."
  );

  return lines;
}
