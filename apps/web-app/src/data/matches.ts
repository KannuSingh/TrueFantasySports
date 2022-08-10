let matches = [
    {
        id: 1,
        title: "Eng vs South Africa 2rd ODI Vitality Series-2022",
        matchDate: "22/07/2022",
        venue: "Birmingham Stadium",
        host: "England",
        opponent: "South Africa",
        time: "2:30 PM EST"
    }
]
export function getMatches() {
    return matches
}
export function getMatch(id: number) {
    return matches.find((match) => match.id === id)
}
