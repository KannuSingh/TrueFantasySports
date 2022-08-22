import React from "react"
import {
    Box,
    Text,
    HStack,
    SimpleGrid,
    List,
    ListItem,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    ListIcon,
    Tooltip
} from "@chakra-ui/react"
import { MdCheckCircle, MdPerson, MdPersonOutline } from "react-icons/md"

import { MyTeam } from "../utils/MyTeam"
import { Fixture, SquadInfo } from "../Model/model"

function ViewMyTeam(props: {
    isOpen: boolean
    fixture: Fixture
    localTeamSquad: SquadInfo[]
    visitorTeamSquad: SquadInfo[]
    contestId: string
    myTeam: MyTeam
    onClose
}) {
    const _localTeamSquadLength = props.localTeamSquad.length

    return (
        <Modal size="2xl" isOpen={props.isOpen} onClose={props.onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>My Team </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <SimpleGrid columns={2} spacing={4}>
                        <Box>
                            <Text bg="blue" textAlign="center">
                                {props.fixture.localteam.name}({props.localTeamSquad.length})
                            </Text>
                            <List key={"host"} spacing={2}>
                                {props.localTeamSquad.map((player, index) => (
                                    <ListItem key={"fsc_" + player.id}>
                                        <HStack justify="space-around">
                                            <Text w="100%" textAlign="start">
                                                {player.fullname}
                                            </Text>
                                            {props.myTeam.team[index][0] == 1 ? (
                                                <>
                                                    <ListIcon as={MdCheckCircle} color="green.500" />
                                                    <Tooltip hasArrow shouldWrapChildren label="Captain">
                                                        {props.myTeam.team[index][1] == 200 ? (
                                                            <ListIcon as={MdPerson} color="blue.500" />
                                                        ) : (
                                                            <></>
                                                        )}
                                                    </Tooltip>
                                                    <Tooltip hasArrow shouldWrapChildren label="Vice Captain">
                                                        {props.myTeam.team[index][1] == 150 ? (
                                                            <ListIcon as={MdPersonOutline} color="blue.500" />
                                                        ) : (
                                                            <></>
                                                        )}
                                                    </Tooltip>
                                                </>
                                            ) : (
                                                <> </>
                                            )}
                                        </HStack>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                        <Box>
                            <Text bg="green" textAlign="center">
                                {props.fixture.visitorteam.name}({props.visitorTeamSquad.length})
                            </Text>
                            <List key={"opponent"} spacing={2}>
                                {props.visitorTeamSquad.map((player, index) => (
                                    <ListItem key={"fsc_" + player.id}>
                                        <HStack justify="space-around">
                                            <Text w="100%" textAlign="start">
                                                {player.fullname}
                                            </Text>
                                            {props.myTeam.team[_localTeamSquadLength + index][0] == 1 ? (
                                                <>
                                                    <ListIcon as={MdCheckCircle} color="green.500" />
                                                    <Tooltip hasArrow shouldWrapChildren label="Captain">
                                                        {props.myTeam.team[_localTeamSquadLength + index][1] == 200 ? (
                                                            <ListIcon as={MdPerson} color="blue.500" />
                                                        ) : (
                                                            <></>
                                                        )}
                                                    </Tooltip>
                                                    <Tooltip hasArrow shouldWrapChildren label="Vice Captain">
                                                        {props.myTeam.team[_localTeamSquadLength + index][1] == 150 ? (
                                                            <ListIcon as={MdPersonOutline} color="blue.500" />
                                                        ) : (
                                                            <></>
                                                        )}
                                                    </Tooltip>
                                                </>
                                            ) : (
                                                <></>
                                            )}
                                        </HStack>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </SimpleGrid>
                </ModalBody>

                <ModalFooter justifyContent="center">
                    <Button onClick={props.onClose}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

export default ViewMyTeam
