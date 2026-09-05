---
layout: post
title: "GitHub Pages + Codespaces + VS Code + Copilot으로 블로그 만들기"
date: 2026-08-27 17:31:14 +0000
category: 개발
tags: [GitHub Pages, Codespaces, VS Code, Copilot]
---

## GitHub Pages를 시작한 이유

Jekyll을 사용하려면 Ruby를 설치해야 한다는 점이 부담스러워서, 그동안 GitHub로 블로그를 운영할 생각은 하지 않았습니다. 그런데 Jekyll이 GitHub Pages의 CI/CD 시스템과 기본으로 연동되어, 별도의 서버 설정 없이도 페이지를 자동으로 배포해 준다는 사실을 알게 되었습니다. 그래서 바로 블로그를 시작해 보기로 했습니다.

## Reverie 테마로 블로그 만들기

처음에는 `_config.yml`을 어떻게 구성해야 하는지도 몰랐기 때문에, 기존 테마 예제를 clone해서 시작하기로 했습니다. 여러 테마 중에서는 비교적 깔끔하고 최근까지 업데이트된 [Reverie](https://github.com/amitmerchant1990/reverie)를 선택했습니다.

[Reverie의 템플릿 생성 페이지](https://github.com/amitmerchant1990/reverie/generate)에서 테마를 내 저장소로 복제할 수 있습니다. GitHub Pages용 저장소 이름은 `{사용자명}.github.io` 형식이어야 하므로 `frontjang-gif.github.io`로 만들었습니다. 버튼을 누르고 몇 분이 지나자 배포가 완료되었고, [블로그](https://frontjang-gif.github.io)에서 결과를 확인할 수 있었습니다.

![GitHub Pages 저장소 생성 화면]({{ site.baseurl }}/images/1787854668201.png)

## Codespaces에서 환경 설정하기

배포가 완료되면 기존 Reverie의 설정값이 `_config.yml`에 들어 있으므로 내 환경에 맞게 수정해야 합니다. 물론 개인 컴퓨터에서 설정해도 되지만, 이번에는 클라우드 환경에서 실행되는 VS Code인 GitHub Codespaces를 사용했습니다. 별도의 개발 환경을 설치하지 않고도 브라우저에서 간편하게 파일을 수정할 수 있다는 점이 좋았습니다.

`_config.yml`에서는 우선 `name`과 `author`만 남기고 나머지 설정을 정리했습니다. 다만 페이지 상단에 로고가 표시되도록 되어 있어, `_layouts/default.html`을 수정해 이미지 부분을 삭제했습니다. 이참에 `about`, `getting started`처럼 현재 블로그와 관련 없는 페이지도 함께 정리했습니다.

## 첫 글 작성하기

기본 설정을 마친 뒤에는 새 글을 작성했습니다. `_posts`의 기존 글을 정리하고 파일명 규칙에 맞춰 새 글을 만들어야 했는데, 처음에는 `Jekyll Helper`라는 VS Code 확장을 사용했습니다. 다만 이 확장은 front matter를 원하는 대로 수정하기 어렵다는 아쉬움이 있었습니다. 나중에는 직접 간단한 확장을 만들어 보는 것도 괜찮겠다는 생각이 들었습니다.

## Markdown 이미지 경로 설정하기

최근 VS Code에서는 Markdown 문서에 이미지를 붙여 넣는 기능도 기본으로 지원하는 것처럼 보입니다. `vscode-paste-image` 같은 확장을 따로 설치하지 않아도 된다는 점은 편리하지만, 기본 저장 경로가 현재 폴더인 `_posts` 아래의 `image.png`로 설정되어 있었습니다. 블로그에서 이미지에 접근하려면 저장 위치와 Markdown 경로를 맞춰야 하므로 이 설정을 변경했습니다.

VS Code 설정에서 `markdown.copyFiles.destination`을 찾아 다음과 같이 입력하면 붙여 넣은 이미지가 `images` 폴더에 timestamp 기반 파일명으로 저장됩니다.

```text
/_posts/*, /images/${unixTime}.${fileExtName}
```

![VS Code Markdown 이미지 저장 경로 설정]({{ site.baseurl }}/images/1787855049878.png)

## 마무리

이렇게 해서 GitHub Pages와 Codespaces를 이용한 블로그 생성부터 글 작성까지, 30분도 되지 않아 기본 작업을 마칠 수 있었습니다. 글 작성과 수정, 블로그 게시(push), 오류 수정에는 Copilot의 도움을 받았고, 덕분에 큰 어려움 없이 진행할 수 있었습니다.

무엇보다 웹 서버와 CI/CD 환경, AI 도구를 모두 무료로 사용할 수 있다는 점이 인상적이었습니다. 다만 Codespaces의 VS Code는 키 입력 반응이 조금 느리게 느껴졌기 때문에, 평소에는 로컬 환경을 사용하고 급할 때 Codespaces를 활용하는 방식이 좋겠습니다.

생각보다 훨씬 간단하게 블로그를 시작할 수 있었습니다. 이제부터는 이 공간에 배운 것과 만들어 본 것들을 하나씩 기록해 보려고 합니다.
