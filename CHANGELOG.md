# [3.2.0](https://github.com/XIYO/xiyo.dev/compare/v3.1.0...v3.2.0) (2026-01-01)


### Bug Fixes

* enable i18n prerendering for en-us and ja-jp routes ([50b7526](https://github.com/XIYO/xiyo.dev/commit/50b7526c5f39fa9f3a5b5eba049719f25cf5ca8e))


### Features

* add Tic-Tac-Toe game and update dependencies ([f4826eb](https://github.com/XIYO/xiyo.dev/commit/f4826eb289813177903f8983fc5d0599c87c86a9))

# [3.1.0](https://github.com/XIYO/xiyo.github.io/compare/v3.0.0...v3.1.0) (2025-10-20)


### Features

* 최근 변경 이력 dlog 작성 및 footer 스타일 간소화 ([c7dc1eb](https://github.com/XIYO/xiyo.github.io/commit/c7dc1ebf1fbe178de6b9f03b10fcf3c853f1343c))

# [3.0.0](https://github.com/XIYO/xiyo.github.io/compare/v2.8.1...v3.0.0) (2025-10-18)


### Bug Fixes

* increase test timeout and fix authors test assertion ([41ff9a0](https://github.com/XIYO/xiyo.github.io/commit/41ff9a06ec2252b0679c0db779bbcc6548744499))
* increase test timeout to 20s for CI environment ([a54ad45](https://github.com/XIYO/xiyo.github.io/commit/a54ad45a6c7a2bd83e5dd067f8517bd5cf29dcfe))
* update semantic-release config for pnpm ([702790e](https://github.com/XIYO/xiyo.github.io/commit/702790eb02883e32fba0568c3499212793acda1d))
* use createdAt consistently across all dlog components and tests ([d4d8da8](https://github.com/XIYO/xiyo.github.io/commit/d4d8da8c4171f5052ac179830b85ca322ca6075d))


### Code Refactoring

* standardize time field names to createdAt/modifiedAt ([71e1336](https://github.com/XIYO/xiyo.github.io/commit/71e1336cd03114e76f4a66cdada2341cf824b6d7))


### Features

* add first dlog entry and fix date display ([b8bc27c](https://github.com/XIYO/xiyo.github.io/commit/b8bc27cd67d9087208d82e023be7dcd17686d1cc))


### BREAKING CHANGES

* Field names in frontmatter have changed from published/lastModified to createdAt/modifiedAt

## [2.8.1](https://github.com/XIYO/xiyo.github.io/compare/v2.8.0...v2.8.1) (2025-10-18)


### Bug Fixes

* add PUBLIC_SITE_URL environment variable to GitHub Actions build steps ([aa5f269](https://github.com/XIYO/xiyo.github.io/commit/aa5f269308538972304538f72841a1d8c88669e2))
* add UTF-8 encoding support for markdown files and remove submodule references ([6f94802](https://github.com/XIYO/xiyo.github.io/commit/6f948029e7621925e4d15ca6391d00549f30a611))

# [2.8.0](https://github.com/XIYO/xiyo.github.io/compare/v2.7.0...v2.8.0) (2025-10-08)


### Features

* hoverable sidebar locale switcher ([bf79cfc](https://github.com/XIYO/xiyo.github.io/commit/bf79cfca1b53530e742194e85a1a511eeec3cbab))

# [2.7.0](https://github.com/XIYO/xiyo.github.io/compare/v2.6.0...v2.7.0) (2025-08-16)

### Features

- **i18n:** add multilingual descriptions for all globe projects ([310fb33](https://github.com/XIYO/xiyo.github.io/commit/310fb339bc89c73d9276ae65a1a99ee7e8a8ab02))

# [2.6.0](https://github.com/XIYO/xiyo.github.io/compare/v2.5.3...v2.6.0) (2025-08-16)

### Features

- add BbaKey project to globe page with automated screenshot ([dfdd02e](https://github.com/XIYO/xiyo.github.io/commit/dfdd02e524fa7fcdb9b99ab2f48ecb5e18f64523))
- add Extractor project to globe page with YouTube subtitle API ([e8a75bf](https://github.com/XIYO/xiyo.github.io/commit/e8a75bf19b2fb846666d77cf39b38a4cfc0d7e94))
- add Zheon YouTube AI summarization service to globe showcase ([6396f8e](https://github.com/XIYO/xiyo.github.io/commit/6396f8edabe9269bf65c64396ff3188dcd8ce4ac))
- configure custom domain blog.xiyo.dev in wrangler.toml ([aab160d](https://github.com/XIYO/xiyo.github.io/commit/aab160d117b7d3e8ceed73ef54275adafd436df4))
- **deploy:** switch to @sveltejs/adapter-cloudflare and worker deploy\n\n- Configure wrangler to use .svelte-kit/cloudflare/\_worker.js\n- Add [assets] binding for worker-served static\n- Update scripts: deploy via wrangler on worker output\n- Fix globe page build by replacing missing paraglide keys with safe text\n\nThis migrates from static adapter to Cloudflare Worker deployment for blog.xiyo.dev. ([d2aac35](https://github.com/XIYO/xiyo.github.io/commit/d2aac352700f1a5ab8b720f92bef803b70c1adf2))

## [2.5.3](https://github.com/XIYO/xiyo.github.io/compare/v2.5.2...v2.5.3) (2025-08-16)

### Bug Fixes

- **build:** optimize Worker bundle by using conditional imports for rehype plugins ([cdc8540](https://github.com/XIYO/xiyo.github.io/commit/cdc8540c8bea2bf12ed5cb9f29aee4bc707cda2a))

## [2.5.2](https://github.com/XIYO/xiyo.github.io/compare/v2.5.1...v2.5.2) (2025-08-16)

### Bug Fixes

- **build:** use /static/public for Naver verification (prerender-safe); add .env.example hint\n\n- Revert to /static/public for prerendered route\n- Ensure build doesn’t fail when var exists (even empty)\n- Keep endpoint returning 404 when unset; 200 with code\n- Include Naver SEO routes and tags improvements ([6d7c081](https://github.com/XIYO/xiyo.github.io/commit/6d7c0812c8fabef53b6205463988e464d80dd325))
- **ci:** add Naver verification environment variable to build step ([f456135](https://github.com/XIYO/xiyo.github.io/commit/f4561350080f0b781b2da98a3003fcea338d4bc2))
- **release:** install Playwright browsers before build to prevent CI failures ([1aa0800](https://github.com/XIYO/xiyo.github.io/commit/1aa0800d9a8bbd634121eebfa82b3c87511386d1))

## [2.5.1](https://github.com/XIYO/xiyo.github.io/compare/v2.5.0...v2.5.1) (2025-08-16)

### Bug Fixes

- **ci:** escape @ symbol in smoke test grep pattern ([5577acd](https://github.com/XIYO/xiyo.github.io/commit/5577acd40e74d01ea481d06f25566660a41b87aa))

# [2.5.0](https://github.com/XIYO/xiyo.github.io/compare/v2.4.0...v2.5.0) (2025-07-30)

### Bug Fixes

- add Playwright browser installation step [skip ci] ([fd5969f](https://github.com/XIYO/xiyo.github.io/commit/fd5969fe0ec15312a9a5afe92f988f7b16bd2491))

### Features

- add content-only deployment workflow [skip ci] ([bd276d3](https://github.com/XIYO/xiyo.github.io/commit/bd276d3026770e97d0b3bb84437bdb814b5468f3))
- match release workflow environment (Node 22, Playwright cache) [skip ci] ([e6f5b5f](https://github.com/XIYO/xiyo.github.io/commit/e6f5b5f87879090e1b5dbcfa2b2ebf4fe837988d))
- match release workflow exactly (except semantic-release) [skip ci] ([7f61a45](https://github.com/XIYO/xiyo.github.io/commit/7f61a45758154c5f4199eb693a662c8598ebdec7))

# [2.4.0](https://github.com/XIYO/xiyo.github.io/compare/v2.3.10...v2.4.0) (2025-07-28)

### Bug Fixes

- correct dark mode utility class from 900 to 950 ([98dd8c3](https://github.com/XIYO/xiyo.github.io/commit/98dd8c3d623a50adbcdc39f8c39c4d5ebba4f607))
- improve table visibility in dark mode with Skeleton UI syntax ([21e5eae](https://github.com/XIYO/xiyo.github.io/commit/21e5eaea9fc5634a528363c7bc680d0d464f7ab4))

### Features

- apply Solarized colors to Mermaid diagrams for better portability ([4386e4b](https://github.com/XIYO/xiyo.github.io/commit/4386e4bf90a43322e1926a2edd285af8dec82d2c)), closes [#71](https://github.com/XIYO/xiyo.github.io/issues/71)

## [2.3.10](https://github.com/XIYO/xiyo.github.io/compare/v2.3.9...v2.3.10) (2025-07-28)

### Bug Fixes

- 헤딩 요소의 바텀 보더 스타일 제거 ([be6da52](https://github.com/XIYO/xiyo.github.io/commit/be6da52c76ba4df3fdc3dcc64f083324ba94b3d4)), closes [#60](https://github.com/XIYO/xiyo.github.io/issues/60)

## [2.3.9](https://github.com/XIYO/xiyo.github.io/compare/v2.3.8...v2.3.9) (2025-07-28)

### Reverts

- Revert "Merge pull request [#59](https://github.com/XIYO/xiyo.github.io/issues/59) from XIYO/58-design-포스트-화면-헤딩의-과도한-스타일-개선" ([b162959](https://github.com/XIYO/xiyo.github.io/commit/b162959996ea459b5c445614d1d5ce90a6f0ad7e))

## [2.3.8](https://github.com/XIYO/xiyo.github.io/compare/v2.3.7...v2.3.8) (2025-07-28)

### Bug Fixes

- remove heading background colors and ensure primary text color ([c6d7b8f](https://github.com/XIYO/xiyo.github.io/commit/c6d7b8fa0931fb7b97cd3f3c3c8fe35279d785ad)), closes [#58](https://github.com/XIYO/xiyo.github.io/issues/58)

## [2.3.7](https://github.com/XIYO/xiyo.github.io/compare/v2.3.6...v2.3.7) (2025-07-27)

### Bug Fixes

- 하위 카테고리 없음 메시지에 패딩 추가 ([#57](https://github.com/XIYO/xiyo.github.io/issues/57)) ([1beee76](https://github.com/XIYO/xiyo.github.io/commit/1beee76fd1b4db4066d9508f4a08bc7f7f85d16c)), closes [#56](https://github.com/XIYO/xiyo.github.io/issues/56)

## [2.3.6](https://github.com/XIYO/xiyo.github.io/compare/v2.3.5...v2.3.6) (2025-07-27)

### Bug Fixes

- GitHub Actions에서 서브모듈 체크아웃 누락 문제 해결 ([46a1001](https://github.com/XIYO/xiyo.github.io/commit/46a1001d8d4a230b0d0374b623388f72916f14e9))

## [2.3.5](https://github.com/XIYO/xiyo.github.io/compare/v2.3.4...v2.3.5) (2025-07-27)

### Bug Fixes

- restore project setup in deploy workflow ([#51](https://github.com/XIYO/xiyo.github.io/issues/51)) ([2a24196](https://github.com/XIYO/xiyo.github.io/commit/2a2419670c4cc3ad3dcc7b543bf876028f423c9b))

## [2.3.4](https://github.com/XIYO/xiyo.github.io/compare/v2.3.3...v2.3.4) (2025-07-27)

### Bug Fixes

- correct build artifact path from .cloudflare/ to build/ ([#50](https://github.com/XIYO/xiyo.github.io/issues/50)) ([cc2766f](https://github.com/XIYO/xiyo.github.io/commit/cc2766fea89fd22e0f0e9065c56a781be8233d4a))

## [2.3.3](https://github.com/XIYO/xiyo.github.io/compare/v2.3.2...v2.3.3) (2025-07-27)

### Bug Fixes

- optimize deploy workflow with build artifacts ([#49](https://github.com/XIYO/xiyo.github.io/issues/49)) ([5e7ebc3](https://github.com/XIYO/xiyo.github.io/commit/5e7ebc31f7fba5077c5c03de8a233172a5b49c1f))

## [2.3.2](https://github.com/XIYO/xiyo.github.io/compare/v2.3.1...v2.3.2) (2025-07-27)

### Bug Fixes

- add actions write permission for workflow dispatch ([#48](https://github.com/XIYO/xiyo.github.io/issues/48)) ([9b59334](https://github.com/XIYO/xiyo.github.io/commit/9b59334844a372eea4383e0ecb9f46c33a21853a))

## [2.3.1](https://github.com/XIYO/xiyo.github.io/compare/v2.3.0...v2.3.1) (2025-07-27)

### Bug Fixes

- prevent duplicate deploy workflow execution ([#47](https://github.com/XIYO/xiyo.github.io/issues/47)) ([99e1dd6](https://github.com/XIYO/xiyo.github.io/commit/99e1dd6e30c0ccee1dd41d91db8d8cb3fcf8ec9d))

# [2.3.0](https://github.com/XIYO/xiyo.github.io/compare/v2.2.0...v2.3.0) (2025-07-27)

### Features

- implement mermaid diagram support with GitHub Actions integration ([ce21706](https://github.com/XIYO/xiyo.github.io/commit/ce21706e62b13c34175db1fe82b5ee3163f451f9))

# [2.2.0](https://github.com/XIYO/xiyo.github.io/compare/v2.1.0...v2.2.0) (2025-07-27)

### Bug Fixes

- remove test step from release workflow to resolve paraglide issue ([be8fcc6](https://github.com/XIYO/xiyo.github.io/commit/be8fcc6565ec7242de523b5a736b4894b69e6b2a))

### Features

- remove Storybook and fix base locale assets routing ([#40](https://github.com/XIYO/xiyo.github.io/issues/40)) ([c9c4b93](https://github.com/XIYO/xiyo.github.io/commit/c9c4b939a84a3e6d432e48d191e52753909fd459))
- semantic-release 자동 버저닝 시스템 구현 ([#19](https://github.com/XIYO/xiyo.github.io/issues/19)) ([#43](https://github.com/XIYO/xiyo.github.io/issues/43)) ([0815959](https://github.com/XIYO/xiyo.github.io/commit/081595986140965cc134fba1537a451fe4fd5517))
