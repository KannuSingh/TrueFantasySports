//
// Copyright 2017 Christian Reitwiessner
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// 2019 OKIMS
//      ported to solidity 0.6
//      fixed linter warnings
//      added requiere error messages
//
//
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;
library Pairing {
    struct G1Point {
        uint X;
        uint Y;
    }
    // Encoding of field elements is: X[0] * z + X[1]
    struct G2Point {
        uint[2] X;
        uint[2] Y;
    }
    /// @return the generator of G1
    function P1() internal pure returns (G1Point memory) {
        return G1Point(1, 2);
    }
    /// @return the generator of G2
    function P2() internal pure returns (G2Point memory) {
        // Original code point
        return G2Point(
            [11559732032986387107991004021392285783925812861821192530917403151452391805634,
             10857046999023057135944570762232829481370756359578518086990519993285655852781],
            [4082367875863433681332203403145435568316851327593401208105741076214120093531,
             8495653923123431417604973247489272438418190587263600148770280649306958101930]
        );

/*
        // Changed by Jordi point
        return G2Point(
            [10857046999023057135944570762232829481370756359578518086990519993285655852781,
             11559732032986387107991004021392285783925812861821192530917403151452391805634],
            [8495653923123431417604973247489272438418190587263600148770280649306958101930,
             4082367875863433681332203403145435568316851327593401208105741076214120093531]
        );
*/
    }
    /// @return r the negation of p, i.e. p.addition(p.negate()) should be zero.
    function negate(G1Point memory p) internal pure returns (G1Point memory r) {
        // The prime q in the base field F_q for G1
        uint q = 21888242871839275222246405745257275088696311157297823662689037894645226208583;
        if (p.X == 0 && p.Y == 0)
            return G1Point(0, 0);
        return G1Point(p.X, q - (p.Y % q));
    }
    /// @return r the sum of two points of G1
    function addition(G1Point memory p1, G1Point memory p2) internal view returns (G1Point memory r) {
        uint[4] memory input;
        input[0] = p1.X;
        input[1] = p1.Y;
        input[2] = p2.X;
        input[3] = p2.Y;
        bool success;
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            success := staticcall(sub(gas(), 2000), 6, input, 0xc0, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require(success,"pairing-add-failed");
    }
    /// @return r the product of a point on G1 and a scalar, i.e.
    /// p == p.scalar_mul(1) and p.addition(p) == p.scalar_mul(2) for all points p.
    function scalar_mul(G1Point memory p, uint s) internal view returns (G1Point memory r) {
        uint[3] memory input;
        input[0] = p.X;
        input[1] = p.Y;
        input[2] = s;
        bool success;
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            success := staticcall(sub(gas(), 2000), 7, input, 0x80, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require (success,"pairing-mul-failed");
    }
    /// @return the result of computing the pairing check
    /// e(p1[0], p2[0]) *  .... * e(p1[n], p2[n]) == 1
    /// For example pairing([P1(), P1().negate()], [P2(), P2()]) should
    /// return true.
    function pairing(G1Point[] memory p1, G2Point[] memory p2) internal view returns (bool) {
        require(p1.length == p2.length,"pairing-lengths-failed");
        uint elements = p1.length;
        uint inputSize = elements * 6;
        uint[] memory input = new uint[](inputSize);
        for (uint i = 0; i < elements; i++)
        {
            input[i * 6 + 0] = p1[i].X;
            input[i * 6 + 1] = p1[i].Y;
            input[i * 6 + 2] = p2[i].X[0];
            input[i * 6 + 3] = p2[i].X[1];
            input[i * 6 + 4] = p2[i].Y[0];
            input[i * 6 + 5] = p2[i].Y[1];
        }
        uint[1] memory out;
        bool success;
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            success := staticcall(sub(gas(), 2000), 8, add(input, 0x20), mul(inputSize, 0x20), out, 0x20)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require(success,"pairing-opcode-failed");
        return out[0] != 0;
    }
    /// Convenience method for a pairing check for two pairs.
    function pairingProd2(G1Point memory a1, G2Point memory a2, G1Point memory b1, G2Point memory b2) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](2);
        G2Point[] memory p2 = new G2Point[](2);
        p1[0] = a1;
        p1[1] = b1;
        p2[0] = a2;
        p2[1] = b2;
        return pairing(p1, p2);
    }
    /// Convenience method for a pairing check for three pairs.
    function pairingProd3(
            G1Point memory a1, G2Point memory a2,
            G1Point memory b1, G2Point memory b2,
            G1Point memory c1, G2Point memory c2
    ) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](3);
        G2Point[] memory p2 = new G2Point[](3);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        return pairing(p1, p2);
    }
    /// Convenience method for a pairing check for four pairs.
    function pairingProd4(
            G1Point memory a1, G2Point memory a2,
            G1Point memory b1, G2Point memory b2,
            G1Point memory c1, G2Point memory c2,
            G1Point memory d1, G2Point memory d2
    ) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](4);
        G2Point[] memory p2 = new G2Point[](4);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p1[3] = d1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        p2[3] = d2;
        return pairing(p1, p2);
    }
}
contract ScoreAndTeamVerifier {
    using Pairing for *;
    struct VerifyingKey {
        Pairing.G1Point alfa1;
        Pairing.G2Point beta2;
        Pairing.G2Point gamma2;
        Pairing.G2Point delta2;
        Pairing.G1Point[] IC;
    }
    struct Proof {
        Pairing.G1Point A;
        Pairing.G2Point B;
        Pairing.G1Point C;
    }
    function verifyingKey() internal pure returns (VerifyingKey memory vk) {
        vk.alfa1 = Pairing.G1Point(
            20491192805390485299153009773594534940189261866228447918068658471970481763042,
            9383485363053290200918347156157836566562967994039712273449902621266178545958
        );

        vk.beta2 = Pairing.G2Point(
            [4252822878758300859123897981450591353533073413197771768651442665752259397132,
             6375614351688725206403948262868962793625744043794305715222011528459656738731],
            [21847035105528745403288232691147584728191162732299865338377159692350059136679,
             10505242626370262277552901082094356697409835680220590971873171140371331206856]
        );
        vk.gamma2 = Pairing.G2Point(
            [11559732032986387107991004021392285783925812861821192530917403151452391805634,
             10857046999023057135944570762232829481370756359578518086990519993285655852781],
            [4082367875863433681332203403145435568316851327593401208105741076214120093531,
             8495653923123431417604973247489272438418190587263600148770280649306958101930]
        );
        vk.delta2 = Pairing.G2Point(
            [16961264832884643842076511978224459149146630181494315110720425264596903991827,
             3721557206724826607841182812706555253544969421203140425563410726024745795475],
            [8388541033674985800984666099263848439368986900956230624042523324509268885664,
             6499732981711281958586612742594151134341543763951052870874836387821761299366]
        );
        vk.IC = new Pairing.G1Point[](33);
        
        vk.IC[0] = Pairing.G1Point( 
            1168285129697404846729611945471229177152329971976901901063339944717286530766,
            10122708651823876469993700586402928761594266374907571209374553013039285084778
        );                                      
        
        vk.IC[1] = Pairing.G1Point( 
            18479086268463693712892476858183965084283006347372987743640875204426013289645,
            8762168354827393451903989864980728619549944253203800539582892416439282516854
        );                                      
        
        vk.IC[2] = Pairing.G1Point( 
            3577710208444511980402368437884582632799208228976908391117296114751486139128,
            21180852509794445753542098570927105351591735118416952283045649697737373450645
        );                                      
        
        vk.IC[3] = Pairing.G1Point( 
            1622558083008051266468523819137308792094563378145252700446825327287615234783,
            19651112605489063233766431900404747464701649404917158987691200435581975808706
        );                                      
        
        vk.IC[4] = Pairing.G1Point( 
            8283109199800397351483545390148558042176513713918330659361720405856383410781,
            12897268082383330027681935363699031484901821235539307740742642627686278298349
        );                                      
        
        vk.IC[5] = Pairing.G1Point( 
            19014221779309269857762853094497065702762085893392752353550412347805202957716,
            21648971760775297083502901659920673355304129483595224797198046766689334854835
        );                                      
        
        vk.IC[6] = Pairing.G1Point( 
            15790136815748733166586519887910697236127815855591706065454656221136802318494,
            6681174069746787373529559090109054119387930605241817745478686789023277564794
        );                                      
        
        vk.IC[7] = Pairing.G1Point( 
            12030980702802959421736177607146505184711192196698783743890980577701420496318,
            4394501786734296282476883492086589705310346079125829039832144245235656670490
        );                                      
        
        vk.IC[8] = Pairing.G1Point( 
            19897467866371929396429163843344412671505438817354545007807217703402233863367,
            1049094341209824140422609964084840742965016808616592193604367034651022636793
        );                                      
        
        vk.IC[9] = Pairing.G1Point( 
            17613362429600401239713424526723177465779865822493179370944488970629917362644,
            17687657465563466730265146977477689320736870016353728174280158485813514186509
        );                                      
        
        vk.IC[10] = Pairing.G1Point( 
            7815939164514879030775611488516130675803917045740239956083811270448519624024,
            18226284300221669862215148745805762621034410212049182370269025619465254169811
        );                                      
        
        vk.IC[11] = Pairing.G1Point( 
            20492723778345609106817629916928909108601147996859931719857990793109199346518,
            8973087305012374199516335271173955532115056508122646185304399901325659439468
        );                                      
        
        vk.IC[12] = Pairing.G1Point( 
            4141720998154715975428922308250440557288231086889150315847733739386528653257,
            19578126791885220663831121939512038984794093517595487979821270683590908544828
        );                                      
        
        vk.IC[13] = Pairing.G1Point( 
            3193540648004920829196725535756315964403540398827827038151152813684588624265,
            3814957298388761048062861831963478917496264429419012164543541978298591214300
        );                                      
        
        vk.IC[14] = Pairing.G1Point( 
            20983497820099716696567731395363320347277873112736399324082919115252350376035,
            6727896400414403056978316352662913119516150526378533427949255457874875198548
        );                                      
        
        vk.IC[15] = Pairing.G1Point( 
            4402417913369941948477472387018458878883738195438545241985856459380612981589,
            21748947015216549943318457738766619730396495047895950772697791928734898085580
        );                                      
        
        vk.IC[16] = Pairing.G1Point( 
            18546891394616073899175823595409460301195217839103003905527587312847492259386,
            17475550111925215977634419514684750176135914950125159157386065093302788090742
        );                                      
        
        vk.IC[17] = Pairing.G1Point( 
            10125811946458138956192844533111848178770579543965250521653428114197852610315,
            16970441399743454011395925477887539196571518193613437183484824888836450067757
        );                                      
        
        vk.IC[18] = Pairing.G1Point( 
            11633540806265189077153046742853683390694570140328958603409132336569837089709,
            2121626384424079748276221548150156860594343037112483720022440444837158717207
        );                                      
        
        vk.IC[19] = Pairing.G1Point( 
            14427292996630863856886021426424854039151042009975715346648542868999601789831,
            20987798732383642360019978379614172737685860332714360530750129858799238982539
        );                                      
        
        vk.IC[20] = Pairing.G1Point( 
            8110721618683510296733426901917456402309610190890118468856814570846594797883,
            20603802174396053274912104207168929204107887706320077417630276823224690655882
        );                                      
        
        vk.IC[21] = Pairing.G1Point( 
            15492843148874781805630255855088404355190832239626022975509175422138359336453,
            18065354520717235842263097384776487350600083411635014027672097404973731445252
        );                                      
        
        vk.IC[22] = Pairing.G1Point( 
            19002530867507510756031467888793418659200338278839479957098406401369719691625,
            5983583721129850459037606118264347555795336125446533589320472674058303149066
        );                                      
        
        vk.IC[23] = Pairing.G1Point( 
            19452923921000449511678969068501071752081208285418288454181209379033337254426,
            7073513850569263990887154563950147491045402041570275050215045627271005363038
        );                                      
        
        vk.IC[24] = Pairing.G1Point( 
            5339614371525168731441944888201848508347602492743485452613343670355936117023,
            10123363186452249190244942526364463627242959194363427375585141419934602531805
        );                                      
        
        vk.IC[25] = Pairing.G1Point( 
            9191703003279377134076269895892508134442047271705981256159553072590487231767,
            5684228046128599053803126241867731772872011999275651330049124626764437286153
        );                                      
        
        vk.IC[26] = Pairing.G1Point( 
            19524198259049210696190282034517903549456813681294988951370847325601984023584,
            1297681345293724746427652657469245782174317871036696003948902172791537988332
        );                                      
        
        vk.IC[27] = Pairing.G1Point( 
            13148286370615058433076477716890746725051211939858296273507596080442607916097,
            21536740855297095892278472219386997612691128295161191474065867652719986534849
        );                                      
        
        vk.IC[28] = Pairing.G1Point( 
            8822127801011526068403214775816612460063299908286448438839530463810556201571,
            4973211052985699822465642875271709034485511312325622359002242944049099205292
        );                                      
        
        vk.IC[29] = Pairing.G1Point( 
            7521554360743933853000298508630089610369090820999805758516328922653038565282,
            14918431782840757020945013801876387351912214366433107945500271749841935606931
        );                                      
        
        vk.IC[30] = Pairing.G1Point( 
            4845646958964115817414862454970193144990555740678989188913762153457716574020,
            15749975980533362598645279587732944541693983107139867761554706374732654759561
        );                                      
        
        vk.IC[31] = Pairing.G1Point( 
            15310263213957845782229844425786158732012283694387693272105264900559373088930,
            5296735675078128208890781194804861669126062058580219718958754989842608430914
        );                                      
        
        vk.IC[32] = Pairing.G1Point( 
            10146146497519523699049565679999319617976679979896838156069660959781747724069,
            11954087784548525927228010769197747898706329901070886502611982664173047432685
        );                                      
        
    }
    function verify(uint[] memory input, Proof memory proof) internal view returns (uint) {
        uint256 snark_scalar_field = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
        VerifyingKey memory vk = verifyingKey();
        require(input.length + 1 == vk.IC.length,"verifier-bad-input");
        // Compute the linear combination vk_x
        Pairing.G1Point memory vk_x = Pairing.G1Point(0, 0);
        for (uint i = 0; i < input.length; i++) {
            require(input[i] < snark_scalar_field,"verifier-gte-snark-scalar-field");
            vk_x = Pairing.addition(vk_x, Pairing.scalar_mul(vk.IC[i + 1], input[i]));
        }
        vk_x = Pairing.addition(vk_x, vk.IC[0]);
        if (!Pairing.pairingProd4(
            Pairing.negate(proof.A), proof.B,
            vk.alfa1, vk.beta2,
            vk_x, vk.gamma2,
            proof.C, vk.delta2
        )) return 1;
        return 0;
    }
    /// @return r  bool true if proof is valid
    function verifyProof(
            uint[2] memory a,
            uint[2][2] memory b,
            uint[2] memory c,
            uint[32] memory input
        ) public view returns (bool r) {
        Proof memory proof;
        proof.A = Pairing.G1Point(a[0], a[1]);
        proof.B = Pairing.G2Point([b[0][0], b[0][1]], [b[1][0], b[1][1]]);
        proof.C = Pairing.G1Point(c[0], c[1]);
        uint[] memory inputValues = new uint[](input.length);
        for(uint i = 0; i < input.length; i++){
            inputValues[i] = input[i];
        }
        if (verify(inputValues, proof) == 0) {
            return true;
        } else {
            return false;
        }
    }
}
