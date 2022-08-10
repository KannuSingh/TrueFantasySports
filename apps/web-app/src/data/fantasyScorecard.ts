let fantasyScorecards = [
    {
        matchId: 1,
        host: [
            { name: "Jason Roy", fantasyScore: 0 },
            { name: "Joe Root", fantasyScore: 0 },
            { name: "Ben Stokes", fantasyScore: 0 },
            { name: "Liam Livingstone", fantasyScore: 0 },
            { name: "Moeen Ali", fantasyScore: 0 },
            { name: "Sam Curran", fantasyScore: 0 },
            { name: "Jonny Bairstow", fantasyScore: 0 },
            { name: "Jos Buttler", fantasyScore: 0 },
            { name: "Phil Salt", fantasyScore: 0 },
            { name: "Adil Rashid", fantasyScore: 0 },
            { name: "Brydon Carse", fantasyScore: 0 },
            { name: "Craig Overton", fantasyScore: 0 },
            { name: "David Willey", fantasyScore: 0 },
            { name: "Matthew Potts", fantasyScore: 0 },
            { name: "Reece Topley", fantasyScore: 0 }
        ],
        opponent: [
            { name: "Aiden Markram", fantasyScore: 0 },
            { name: "David Miller", fantasyScore: 0 },
            { name: "Janneman Malan", fantasyScore: 0 },
            { name: "Khaya Zondo", fantasyScore: 0 },
            { name: "Rassie van der Dussen", fantasyScore: 0 },
            { name: "Reeza Hendricks", fantasyScore: 0 },
            { name: "Andile Phehlukwayo", fantasyScore: 0 },
            { name: "Dwaine Pretorius", fantasyScore: 0 },
            { name: "Marco Jansen", fantasyScore: 0 },
            { name: "Heinrich Klaasen", fantasyScore: 0 },
            { name: "Kyle Verreynne", fantasyScore: 0 },
            { name: "Quinton de Kock", fantasyScore: 0 },
            { name: "Anrich Nortje", fantasyScore: 0 },
            { name: "Keshav Maharaj", fantasyScore: 0 },
            { name: "Lizaad Williams", fantasyScore: 0 },
            { name: "Lungi Nigidi", fantasyScore: 0 },
            { name: "Tabraiz Shamsi", fantasyScore: 0 }
        ]
    }
]
export function getFantasyScorecards() {
    return fantasyScorecards
}
export function getFantasyScorecard(matchId: number) {
    return fantasyScorecards.find((fantasyScorecard) => fantasyScorecard.matchId === matchId)
}
