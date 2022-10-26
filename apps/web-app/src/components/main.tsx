import React, { useEffect, useState } from "react"
import {
  Box,
  useColorModeValue,
  Drawer,
  DrawerContent,
  useDisclosure,
} from '@chakra-ui/react';
import { NavLink as RouterLink, Outlet, useNavigate } from "react-router-dom"
import { Contract } from "ethers"
import detectEthereumProvider from "@metamask/detect-provider"
import { getTFSTokenContract } from "../walletUtils/MetaMaskUtils"
import { selectMetaMaskConnected } from "../redux_slices/metamaskSlice"
import { useSelector } from "react-redux"
import SidebarContent from "./SidebarContent";
import Header from "./header";

function Main() {
    const _metamaskConnected = useSelector(selectMetaMaskConnected)
    const [_sportId, setSportId] = useState("")
    const [_formSubmitted, setFormSubmitted] = useState(false)
    const [_mintFormSubmitted, setMintFormSubmitted] = useState(false)
    const [_mintError, setMintError] = useState(false)
    const [_tfsTokenContract, setTFSTokenContract] = useState<Contract>()
    const [_log, setLog] = useState("")
    const navigate = useNavigate()

    useEffect(() => {
        ;(async () => {
            if (!_metamaskConnected) {
                setLog("Please connect your metamask to view contests.")
            } else {
                const ethereum = (await detectEthereumProvider()) as any
                const tfsTokenContract = getTFSTokenContract(ethereum)
                setTFSTokenContract(tfsTokenContract)
            }
        })()
    }, [])

    const handleSelectSports = () => {
        setFormSubmitted(true)
        console.log("Selected sport Id : " + _sportId)
        if (_sportId == "1") {
            navigate(`/cricket`)
        }
    }
    const handleTokenMint = async () => {
        try {
            setMintFormSubmitted(true)

            setLog("Waiting for token mint transaction approval from user...")
            const tokenApprovalTransaction = await _tfsTokenContract!.mint10Token()
            setLog("Waiting for token mint transaction confirmation...")
            await tokenApprovalTransaction.wait()
            setLog("Successfully minted token. Please check you wallet balance...")
            setLog("")
        } catch (e) {
            setLog("")
            setMintError(true)
            console.log(e)
        }
    }

    const isError = _sportId === ""

    const { isOpen, onOpen, onClose } = useDisclosure();
    return (
        <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.850')}>
        <SidebarContent
          onClose={() => onClose}
          display={{ base: 'none', md: 'block' }}
        />
        <Drawer
        id='drawer'
          autoFocus={false}
          isOpen={isOpen}
          placement="left"
          onClose={onClose}
          returnFocusOnClose={false}
          onOverlayClick={onClose}
          size="full">
          <DrawerContent>
            <SidebarContent onClose={onClose} />
          </DrawerContent>
        </Drawer>
        {/* mobilenav */}
        <Header onOpen={onOpen} />
        <Box 
            ml={{ base: 0, md: 48 }}
            mt={{ base: 0, md: 20 }}
            p="4">
          <Outlet/>
        </Box>
      </Box>

        
    )
}

export default Main
