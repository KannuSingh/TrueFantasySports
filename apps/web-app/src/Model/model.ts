export interface League {
    resource: string
    id: number
    season_id: number
    country_id: number
    name: string
    code: string
    image_path: string
    type: string
    updated_at: Date
    country: Country
    seasons: Season[]
}

export interface Country {
    resource: string
    id: number
    continent_id: number
    name: string
    image_path: string
    updated_at: Date
}

export interface Season {
    resource: string
    id: number
    league_id: number
    name: string
    code: string
    updated_at: Date
}

export interface Fixture {
    resource: string
    id: number
    league_id: number
    season_id: number
    stage_id: number
    round: string
    localteam_id: number
    visitorteam_id: number
    starting_at: Date
    type: string
    live: boolean
    status: string
    last_period: null
    note: string
    venue_id: number
    toss_won_team_id: number
    winner_team_id: number
    draw_noresult: null
    first_umpire_id: null
    second_umpire_id: number
    tv_umpire_id: null
    referee_id: null
    man_of_match_id: number
    man_of_series_id: null
    total_overs_played: number
    elected: string
    super_over: boolean
    follow_on: boolean
    localteam_dl_data: TeamDLData
    visitorteam_dl_data: TeamDLData
    rpc_overs: null
    rpc_target: null
    weather_report: any[]
    localteam: SeasonTeam
    visitorteam: SeasonTeam
    venue: Venue
}

export interface TeamDLData {
    score: null
    overs: null
    wickets_out: null
}

export interface Venue {
    resource: string
    id: number
    country_id: number
    name: string
    city: string
    image_path: string
    capacity: null
    floodlight: boolean
    updated_at: Date
}

export interface SeasonTeam {
    resource: string
    id: number
    name: string
    code: string
    image_path: string
    country_id: number
    national_team: boolean
    updated_at: Date
    squad?: SquadInfo[]
}

export interface SquadInfo {
    resource: string
    id: number
    country_id: number
    firstname: string
    lastname: string
    fullname: string
    image_path: string
    dateofbirth: Date
    gender: Gender
    battingstyle: BattingStyle
    bowlingstyle: null | string
    position: Position
    updated_at: Date
}

export enum BattingStyle {
    LeftHandBat = "left-hand-bat",
    RightHandBat = "right-hand-bat"
}

export enum Gender {
    M = "m"
}

export interface Position {
    resource: string
    id: number
    name: PositionName
}

export enum PositionName {
    Allrounder = "Allrounder",
    Batsman = "Batsman",
    Bowler = "Bowler",
    Wicketkeeper = "Wicketkeeper"
}
