import React, { useContext, useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  Center,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Spinner,
  Text,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { BoardComment } from "../comment/BoardComment";
import BoardLike from "../like/BoardLike";
import YoutubeInfo from "../component/YoutubeInfo";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { DetectLoginContext } from "../component/LoginProvider";
import MemberProfile from "../member/MemberProfile";
import ScrollToTop from "../util/ScrollToTop";

function BoardView() {
  /* 로그인 정보 컨텍스트 */
  const { token, handleLogout, loginInfo, validateToken } =
    useContext(DetectLoginContext);

  // state
  const [board, setBoard] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [like, setLike] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  /* 작성자 본인이 맞는지 확인 하는 state */
  const [isAuthor, setIsAuthor] = useState(false);
  // const [isReadOnly, setIsReadOnly] = useState(true);

  //URL 매개변수 추출
  const { id } = useParams();

  // 현재 URL 파악하기
  const location = useLocation();
  const boardInfo = location.state;

  // 현재 URL에서 category 명 추출
  const currentParams = new URLSearchParams(location.search).get("category");

  // navigate
  const navigate = useNavigate();

  /* use toast */
  const toast = useToast();

  //  ck에디터 설정 값 (toolbar 삭제함)
  const editorConfig = {
    toolbar: [],
    width: "800px",
    height: "800px",
  };

  // 초기 렌더링
  useEffect(() => {
    console.log("랜더링 테스트");
    axios.get("/api/board/id/" + id).then((response) => {
      setBoard(response.data);

      if (!response.data.is_show) {
        navigate("board/list?category=notice");
        window.alert("삭제된 게시물입니다.");
      }

      // 게시글 데이터를 가져온 후 작성자 여부를 확인하여 isAuthor 설정
      if (loginInfo && loginInfo.member_id === response.data.board_member_id) {
        setIsAuthor(true);
      }
    });
  }, [isSubmitting, location, loginInfo]);

  // 초기 렌더링 파일 목록 가져오기
  useEffect(() => {
    axios.get("/api/file/list/" + id).then((response) => {
      setUploadFiles(response.data);
    });
  }, []);

  // board 불러오지 못할 시 로딩중 표시
  if (board === null) {
    return <Spinner />;
  }

  // 게시글 삭제 버튼 클릭
  function handleDeleteClick() {
    // 게시글 삭제 시 아이디 유효성 검증
    if (!isAuthor) {
      window.alert("작성자 본인만 삭제 가능합니다.");
      return;
    }

    axios
      .put("/api/board/remove/" + id, {
        id: board.id,
        title: board.title,
        content: board.content,
        link: board.link,
        board_category_code: board.board_category_code,
        board_member_id: board.board_member_id,
        created_at: board.created_at,
        updated_at: board.updated_at,
        is_show: board.is_show,
        countlike: board.countlike,
        views: board.views,
        login_member_id: loginInfo.member_id,
      })
      .then(() => {
        toast({
          description: "삭제되었습니다.",
          status: "success",
        });
        navigate("/board/list");
      })
      .catch((error) => {
        if (error.response.status === 403) {
          toast({
            description: "게시글 삭제는 작성자만 가능합니다.",
            status: "error",
          });
          return;
        }

        if (error.response.status === 401) {
          toast({
            description: "권한 정보가 없습니다.",
            status: "error",
          });
          return;
        }

        if (error.response) {
          toast({
            description: "게시글 삭제에 실패했습니다.",
            status: "error",
          });
          return;
        }

        console.log("error");
      })
      .finally(() => console.log("done"));
  }

  // 수정 버튼 클릭
  function handleEditClick() {
    // 로그인 여부 검증
    if (!isAuthor) {
      window.alert("작성자 본인만 수정 가능합니다.");
      return;
    }

    // 작성자 본인 여부 검증
    if (loginInfo.member_id === board.board_member_id) {
      navigate("/board/edit/" + id);
    } else {
      window.alert("작성자 본인만 수정이 가능합니다.");
    }
  }

  // 링크 복사 버튼 클릭
  function handleCopyClick() {
    navigator.clipboard
      .writeText(board.link)
      .then(() => {
        toast({
          description: "링크가 복사되었습니다.",
          status: "success",
        });
      })
      .catch(() => {
        toast({
          description: "링크가 복사에 실패하였습니다 ㅠㅠ",
          status: "error",
        });
      });
  }

  // 유튜브 섹션 렌더링 여부 결정 함수
  function renderYoutubeSection() {
    console.log("링크: " + board.link);
    if (!board.link) {
      return <Text>링크가 없네용</Text>;
    }

    return (
      <FormControl mb={2}>
        <FormLabel fontSize="xl" fontWeight="bold" color="purple.500">
          추천 유튜브 영상
        </FormLabel>
        <Center>
          <Flex m={2} ml={0} gap={5}>
            {/* 유튜브 영상 출력 */}
            <YoutubeInfo link={board.link} extraVideo={true} />
            <Card
              p={2}
              backgroundColor={"rgb(211,217,216)"}
              justifyContent={"center"}
            >
              <Button
                onClick={() => window.open(board.link)}
                colorScheme="red"
                mb={5}
              >
                유튜브 영상 페이지로 이동
              </Button>
              <Button onClick={handleCopyClick} colorScheme="blue">
                유튜브 링크 복사
              </Button>
            </Card>
          </Flex>
        </Center>
      </FormControl>
    );
  }

  return (
    <Center>
      <Box mt={"20px"} w={"70%"}>
        <Box mb={5}>
          <Heading>{boardInfo} 게시판</Heading>
        </Box>
        <Heading>{board.id} 번 게시글 보기(임시 게시글 번호 확인용!!)</Heading>

        {/* -------------------- 상단 영역 -------------------- */}
        <FormControl mt={10} mb={2}>
          {/* 제목 */}
          <Text fontSize={"xx-large"} as={"strong"}>
            {board.title}
          </Text>
          <Flex justifyContent={"space-between"} alignItems={"center"}>
            <Flex alignItems={"center"}>
              {/* 프로필 */}
              <HStack>
                <Flex width={"150px"}>
                  <Avatar src="https://i.imgur.com/lmSDJtn.jpeg" />
                  <Box ml="3">
                    <Tooltip label={board.nickname} placement="top-start">
                      <Text fontWeight="bold">
                        {board.nickname.slice(0, 8)}...
                      </Text>
                    </Tooltip>
                    <Text fontSize="sm">{board.role_name}</Text>
                  </Box>
                </Flex>
              </HStack>

              {/* 일자 */}
              <Text>| {board.updated_at}</Text>
            </Flex>
            {/* 좋아요, 조회수 */}
            <Flex alignItems={"center"} gap={"5"}>
              <BoardLike id={id} like={like} board={board} />
              <Text> | 조회수 : {board.views}</Text>
            </Flex>
          </Flex>
        </FormControl>

        <Divider my={5} borderColor="grey" />

        {/* -------------------- 유튜브 섹션 -------------------- */}
        {renderYoutubeSection()}

        <Divider my={5} borderColor="grey" />

        {/* -------------------- 본문 -------------------- */}
        <FormControl mb={2}>
          {/*<FormLabel>본문</FormLabel>*/}
          <Box>
            {/* CKEditor 본문 영역 onReady => 높이 설정 */}
            {board && (
              <CKEditor
                disabled={"true"}
                editor={ClassicEditor}
                data={board.content}
                config={editorConfig}
                onReady={(editor) => {
                  editor.ui.view.editable.element.style.minHeight = "500px";
                }}
              />
            )}
          </Box>
        </FormControl>

        {/* -------------------- 파일 리스트 -------------------- */}
        {uploadFiles.length > 0 && (
          <Box mb={2}>
            <Text>파일 목록</Text>
            <Box border={"1px solid #edf1f6"} h={"auto"} textIndent={"10px"}>
              {uploadFiles.map((fileList) => (
                <Link
                  key={fileList.id}
                  style={{ display: "block", color: "blue" }}
                  to={fileList.fileurl}
                >
                  {fileList.filename}
                </Link>
              ))}
            </Box>
          </Box>
        )}
        {/* -------------------- 버튼 섹션 -------------------- */}
        <Flex justifyContent={"right"}>
          {isAuthor && (
            <Box mr={"10px"}>
              {/* 수정 버튼 */}
              <Button
                colorScheme="purple"
                onClick={handleEditClick}
                mr={"10px"}
              >
                수정
              </Button>

              {/* 삭제 버튼 */}
              <Button colorScheme="red" onClick={handleDeleteClick}>
                삭제
              </Button>
            </Box>
          )}
          {/* 목록 버튼 */}
          <Button
            colorScheme="blue"
            onClick={() => navigate("/board/list?category=" + currentParams)}
          >
            목록
          </Button>
        </Flex>
        {/* -------------------- 댓글 영역 -------------------- */}

        <BoardComment board_id={id} boardData={board} />
        <ScrollToTop />
      </Box>
    </Center>
  );
}

export default BoardView;
