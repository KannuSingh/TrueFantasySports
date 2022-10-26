import React from "react"
import { Box, BoxProps, CloseButton, Flex, FlexProps, Icon, Link, Text, useColorModeValue, VStack } from "@chakra-ui/react";
import { IconType } from "react-icons";
import { FiCompass, FiHome, FiSettings, FiStar, FiTrendingUp } from "react-icons/fi";
import { NavLink as RouterLink} from "react-router-dom"
import { GiAmericanFootballBall, GiCricketBat, GiSoccerBall, GiHockey, GiBasketballBall} from "react-icons/gi";

interface LinkItemProps {
    name: string;
    icon: IconType;
    url: string;
  }

  
  const LinkItems: Array<LinkItemProps> = [
    { name: 'Cricket', icon: GiCricketBat, url:'/cricket' },
    { name: 'Football', icon: GiSoccerBall, url:'/football' },
    { name: 'NFL', icon: GiAmericanFootballBall, url:'/nfl' },
    { name: 'NHL', icon: GiHockey, url:'/nhl' },
    { name: 'NBA', icon: GiBasketballBall, url:'/nba' },
  ];
  interface NavItemProps extends FlexProps {
    icon: IconType;
    name: string;
    url:string;
  }
  
  const NavItem = ({ icon, name, url, userSelect, ...rest }: NavItemProps) => {
    return (
      <Link as={RouterLink} to={url} 
            style={({ isActive }) => {
              return {
                borderLeft: isActive ? "5px solid red": "",
                display: "block",
                margin: "1rem 0",
                color: isActive ? "red" : "",
                
              };
            }} 
           _hover={{textDecoration: 'none' }}
            _focus={{ boxShadow: 'none'}}>
        <Flex
          align="center"
          p="4"
          mx="4"
          borderRadius="lg"
          role="group"
          cursor="pointer"
          _hover={{
            color: 'red',
          }}
          {...rest}>
          {icon && (
            <Icon
              mr="4"
              w='6'
              h='6'
             
              as={icon}
            />
          )}
          {name}
        </Flex>
      </Link>
    );
  };
interface SidebarProps extends BoxProps {
    onClose: () => void;
  }
  
  const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
    return (
      <Box
        
        bg={useColorModeValue('white', 'gray.900')}
        borderRight="1px"
        borderRightColor={useColorModeValue('gray.200', 'gray.700')}
        w={{ base: 'full', md: 48 }}
        pos="fixed"
        h="full"
        mt={{base: 'none',md:'none'}}

        {...rest}>
        <Flex h="24" alignItems="center" mx="6" justifyContent="space-between" display={{ base: 'flex', md: 'none' }}>
          <VStack spacing='1'>
              <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
                TFS
              </Text> 
              <Text fontSize="md" fontFamily="monospace" fontWeight="bold">
                True Fantasy Sports
              </Text>
          </VStack>
          <CloseButton  onClick={onClose} />
        </Flex>

        {LinkItems.map((link) => (
          <NavItem key={link.name} icon={link.icon} name={link.name} url={link.url} />
            
        ))}
      </Box>
    );
  };

  export default SidebarContent