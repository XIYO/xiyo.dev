/// <reference types="vitest/globals" />
import { describe, it, expect } from 'vitest';
import { mount, unmount } from 'svelte';
import DlogItem from '../src/lib/components/dlog/DlogItem.svelte';
import DlogList from '../src/lib/components/dlog/DlogList.svelte';

describe.skip('Dlog Components - Browser Mode', () => {
	describe('DlogItem Component', () => {
		it('should render dlog item with content', async () => {
			const mockDlog = {
				absolutePath: '/dlog/2025-01-18T05-00-00Z',
				data: {
					createdAt: '2025-01-18T05:00:00Z',
					tags: ['dev', 'sveltekit']
				},
				value: '<p>테스트 콘텐츠입니다.</p>'
			};

			const target = document.createElement('ul');
			target.classList.add('dlog-list');
			document.body.appendChild(target);

			const component = mount(DlogItem, {
				target,
				props: {
					dlog: mockDlog,
					lang: 'ko'
				}
			});

			expect(component).toBeDefined();
			expect(target.innerHTML).toContain('테스트 콘텐츠입니다');

			unmount(component);
			target.remove();
		});

		it('should display tags correctly', async () => {
			const mockDlog = {
				absolutePath: '/dlog/test',
				data: {
					createdAt: '2025-01-18T05:00:00Z',
					tags: ['test', 'dlog']
				},
				value: '<p>Content</p>'
			};

			const target = document.createElement('ul');
			target.classList.add('dlog-list');
			document.body.appendChild(target);

			const component = mount(DlogItem, {
				target,
				props: {
					dlog: mockDlog,
					lang: 'ko'
				}
			});

			expect(target.innerHTML).toContain('#test');
			expect(target.innerHTML).toContain('#dlog');

			unmount(component);
			target.remove();
		});

		it('should format date correctly for Korean', async () => {
			const mockDlog = {
				absolutePath: '/dlog/test',
				data: {
					createdAt: '2025-01-18T05:00:00Z',
					tags: []
				},
				value: '<p>Content</p>'
			};

			const target = document.createElement('ul');
			target.classList.add('dlog-list');
			document.body.appendChild(target);

			const component = mount(DlogItem, {
				target,
				props: {
					dlog: mockDlog,
					lang: 'ko'
				}
			});

			const dateText = target.textContent;
			expect(dateText).toContain('2025');

			unmount(component);
			target.remove();
		});
	});

	describe('DlogList Component', () => {
		it('should render dlog list when dlogs exist', async () => {
			const mockDlogs = [
				{
					absolutePath: '/dlog/1',
					data: {
						createdAt: '2025-01-18T05:00:00Z',
						tags: ['test']
					},
					value: '<p>First</p>'
				},
				{
					absolutePath: '/dlog/2',
					data: {
						createdAt: '2025-01-17T05:00:00Z',
						tags: ['test']
					},
					value: '<p>Second</p>'
				}
			];

			const target = document.createElement('main');
			document.body.appendChild(target);

			const component = mount(DlogList, {
				target,
				props: {
					dlogs: mockDlogs,
					lang: 'ko'
				}
			});

			expect(component).toBeDefined();
			expect(target.innerHTML).toContain('최근 생각들');

			unmount(component);
			target.remove();
		});

		it('should not render when dlogs is empty', async () => {
			const target = document.createElement('main');
			document.body.appendChild(target);

			const component = mount(DlogList, {
				target,
				props: {
					dlogs: [],
					lang: 'ko'
				}
			});

			expect(target.innerHTML).not.toContain('최근 생각들');

			unmount(component);
			target.remove();
		});
	});
});
