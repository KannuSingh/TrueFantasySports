let squads = [
    {
        matchId: 1,
        host: [
            "Jason Roy",
            "Joe Root",
            "Ben Stokes",
            "Liam Livingstone",
            "Moeen Ali",
            "Sam Curran",
            "Jonny Bairstow",
            "Jos Buttler",
            "Phil Salt",
            "Adil Rashid",
            "Brydon Carse",
            "Craig Overton",
            "David Willey",
            "Matthew Potts",
            "Reece Topley"
        ],
        opponent: [
            "Aiden Markram",
            "David Miller",
            "Janneman Malan",
            "Khaya Zondo",
            "Rassie van der Dussen",
            "Reeza Hendricks",
            "Andile Phehlukwayo",
            "Dwaine Pretorius",
            "Marco Jansen",
            "Heinrich Klaasen",
            "Kyle Verreynne",
            "Quinton de Kock",
            "Anrich Nortje",
            "Keshav Maharaj",
            "Lizaad Williams",
            "Lungi Nigidi",
            "Tabraiz Shamsi"
        ]
    }
]
export function getSquads() {
    return squads
}
export function getSquad(matchId: number) {
    return squads.find((squad) => squad.matchId === matchId)
}
