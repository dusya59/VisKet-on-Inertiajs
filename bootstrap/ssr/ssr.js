import { Fragment, TransitionGroup, computed, createBlock, createCommentVNode, createSSRApp, createTextVNode, createVNode, h, mergeProps, nextTick, onMounted, onUnmounted, openBlock, reactive, ref, renderList, toDisplayString, unref, useSSRContext, vModelText, vShow, watch, withCtx, withDirectives, withKeys, withModifiers } from "vue";
import { renderToString, ssrIncludeBooleanAttr, ssrInterpolate, ssrLooseContain, ssrLooseEqual, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList, ssrRenderSlot, ssrRenderStyle } from "vue/server-renderer";
import { Head, Link, createInertiaApp, router, useForm, usePage } from "@inertiajs/vue3";
import axios$1 from "axios";
import Echo from "laravel-echo";
import createServer from "@inertiajs/vue3/server";
//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
//#region resources/js/composables/useDarkMode.js
var isDark = ref(false);
function useDarkMode() {
	onMounted(() => {
		isDark.value = localStorage.getItem("darkMode") === "true";
		updateHtmlClass();
	});
	const toggleDarkMode = () => {
		isDark.value = !isDark.value;
		localStorage.setItem("darkMode", isDark.value);
		updateHtmlClass();
	};
	const updateHtmlClass = () => {
		if (isDark.value) document.documentElement.classList.add("dark");
		else document.documentElement.classList.remove("dark");
	};
	return {
		isDark,
		toggleDarkMode
	};
}
//#endregion
//#region \0plugin-vue:export-helper
var _plugin_vue_export_helper_default = (sfc, props) => {
	const target = sfc.__vccOpts || sfc;
	for (const [key, val] of props) target[key] = val;
	return target;
};
//#endregion
//#region resources/js/Layouts/AppLayout.vue
var _sfc_main$22 = {
	__name: "AppLayout",
	__ssrInlineRender: true,
	setup(__props) {
		const page = usePage();
		const authUser = computed(() => page.props.auth?.user || page.props.authUser || null);
		const menuTrigger = ref(null);
		useDarkMode();
		const menuOpen = ref(false);
		const closeMenu = () => menuOpen.value = false;
		const handleClickOutside = (event) => {
			if (menuTrigger.value && !menuTrigger.value.contains(event.target)) closeMenu();
		};
		onMounted(() => {
			menuOpen.value = false;
			document.addEventListener("click", handleClickOutside);
		});
		onUnmounted(() => {
			document.removeEventListener("click", handleClickOutside);
		});
		const mainClass = computed(() => {
			if (page.component === "Home" || page.component === "Profile/Show" || page.component === "Profile/Edit" || page.component === "Chat/Chats" || page.component === "Posts/Show" || page.component === "Admin/Index" || page.component === "Admin/Comments" || page.component === "Admin/Posts" || page.component === "Admin/Users" || page.component === "Profile/LikedPosts" || page.component === "Auth/Auth.vue" || page.component === "Settings/Index" || page.component === "Settings/Notifications") return "main-home";
			return "main-padded";
		});
		const footerClass = computed(() => {
			if (page.component === "Chat/Chats") return "footer-hidden";
			return "";
		});
		const headerClass = computed(() => {
			return page.component === "Home" ? "header-home" : "";
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(_attrs)} data-v-20f57fe6><header class="${ssrRenderClass(headerClass.value)}" data-v-20f57fe6>`);
			_push(ssrRenderComponent(unref(Link), {
				class: "logo",
				href: "/"
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<p class="l1" data-v-20f57fe6${_scopeId}>vis</p><p class="l2" data-v-20f57fe6${_scopeId}>ket</p>`);
					else return [createVNode("p", { class: "l1" }, "vis"), createVNode("p", { class: "l2" }, "ket")];
				}),
				_: 1
			}, _parent));
			if (authUser.value) {
				_push(`<div class="menu-trigger" data-v-20f57fe6>`);
				if (authUser.value.avatar && authUser.value.avatar.startsWith("http")) _push(`<img${ssrRenderAttr("src", authUser.value.avatar)} alt="avatar" class="header-avatar" data-v-20f57fe6>`);
				else if (authUser.value.avatar) _push(`<img${ssrRenderAttr("src", "/storage/" + authUser.value.avatar)} alt="avatar" class="header-avatar" data-v-20f57fe6>`);
				else _push(`<img src="/images/User-avatar.png" alt="avatar" class="header-avatar" data-v-20f57fe6>`);
				_push(`<img class="burger-menu" src="/images/burger.svg" alt="burger-menu" data-v-20f57fe6><div class="${ssrRenderClass([{ "dropdown-open": menuOpen.value }, "dropdown-menu"])}" data-v-20f57fe6>`);
				if (authUser.value.is_admin) _push(ssrRenderComponent(unref(Link), {
					href: "/admin",
					onClick: closeMenu
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`<img src="/images/database.svg" alt="" class="menu-icon" data-v-20f57fe6${_scopeId}> Админ панель `);
						else return [createVNode("img", {
							src: "/images/database.svg",
							alt: "",
							class: "menu-icon"
						}), createTextVNode(" Админ панель ")];
					}),
					_: 1
				}, _parent));
				else _push(`<!---->`);
				_push(ssrRenderComponent(unref(Link), {
					href: "/chats",
					onClick: closeMenu
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) {
							_push(`<img src="/images/speech-bubble.svg" alt="" class="menu-icon" data-v-20f57fe6${_scopeId}> Чаты `);
							if (authUser.value.unreadChatsCount) _push(`<span class="counter-badge" data-v-20f57fe6${_scopeId}>${ssrInterpolate(authUser.value.unreadChatsCount)}</span>`);
							else _push(`<!---->`);
						} else return [
							createVNode("img", {
								src: "/images/speech-bubble.svg",
								alt: "",
								class: "menu-icon"
							}),
							createTextVNode(" Чаты "),
							authUser.value.unreadChatsCount ? (openBlock(), createBlock("span", {
								key: 0,
								class: "counter-badge"
							}, toDisplayString(authUser.value.unreadChatsCount), 1)) : createCommentVNode("", true)
						];
					}),
					_: 1
				}, _parent));
				_push(ssrRenderComponent(unref(Link), {
					href: "/profile/" + authUser.value.id,
					onClick: closeMenu
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`<img src="/images/person.svg" alt="" class="menu-icon" data-v-20f57fe6${_scopeId}> Профиль `);
						else return [createVNode("img", {
							src: "/images/person.svg",
							alt: "",
							class: "menu-icon"
						}), createTextVNode(" Профиль ")];
					}),
					_: 1
				}, _parent));
				_push(ssrRenderComponent(unref(Link), {
					href: "/balance",
					onClick: closeMenu
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) {
							_push(`<img src="/images/wallet.svg" alt="" class="menu-icon" data-v-20f57fe6${_scopeId}> Баланс: ${ssrInterpolate(authUser.value.balance)} ₽ `);
							if (authUser.value.hasPendingTransactions) _push(`<span class="pending-badge" data-v-20f57fe6${_scopeId}>Ожидание...</span>`);
							else _push(`<!---->`);
						} else return [
							createVNode("img", {
								src: "/images/wallet.svg",
								alt: "",
								class: "menu-icon"
							}),
							createTextVNode(" Баланс: " + toDisplayString(authUser.value.balance) + " ₽ ", 1),
							authUser.value.hasPendingTransactions ? (openBlock(), createBlock("span", {
								key: 0,
								class: "pending-badge"
							}, "Ожидание...")) : createCommentVNode("", true)
						];
					}),
					_: 1
				}, _parent));
				_push(ssrRenderComponent(unref(Link), {
					href: "/notifications",
					onClick: closeMenu
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) {
							_push(`<img src="/images/bell.svg" alt="" class="menu-icon" data-v-20f57fe6${_scopeId}> Уведомления `);
							if (authUser.value.unreadNotificationsCount) _push(`<span class="counter-badge" data-v-20f57fe6${_scopeId}>${ssrInterpolate(authUser.value.unreadNotificationsCount)}</span>`);
							else _push(`<!---->`);
						} else return [
							createVNode("img", {
								src: "/images/bell.svg",
								alt: "",
								class: "menu-icon"
							}),
							createTextVNode(" Уведомления "),
							authUser.value.unreadNotificationsCount ? (openBlock(), createBlock("span", {
								key: 0,
								class: "counter-badge"
							}, toDisplayString(authUser.value.unreadNotificationsCount), 1)) : createCommentVNode("", true)
						];
					}),
					_: 1
				}, _parent));
				_push(ssrRenderComponent(unref(Link), {
					href: "/settings",
					onClick: closeMenu
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`<img src="/images/settings.svg" alt="" class="menu-icon" data-v-20f57fe6${_scopeId}> Настройки `);
						else return [createVNode("img", {
							src: "/images/settings.svg",
							alt: "",
							class: "menu-icon"
						}), createTextVNode(" Настройки ")];
					}),
					_: 1
				}, _parent));
				_push(`<button type="button" data-v-20f57fe6><img src="/images/exit.svg" alt="" class="menu-icon" data-v-20f57fe6> Выйти </button></div></div>`);
			} else _push(ssrRenderComponent(unref(Link), {
				href: "/login",
				class: "login-link"
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`Войти`);
					else return [createTextVNode("Войти")];
				}),
				_: 1
			}, _parent));
			_push(`</header><div class="${ssrRenderClass([{ "overlay-active": menuOpen.value }, "overlay overlay-active-mobile"])}" data-v-20f57fe6></div><div class="${ssrRenderClass([{ "mobile-menu-open": menuOpen.value }, "mobile-menu"])}" data-v-20f57fe6><button class="mobile-menu-close" data-v-20f57fe6>✕</button>`);
			if (authUser.value) {
				_push(`<!--[-->`);
				if (authUser.value.is_admin) _push(ssrRenderComponent(unref(Link), {
					href: "/admin",
					onClick: closeMenu
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`Админ панель`);
						else return [createTextVNode("Админ панель")];
					}),
					_: 1
				}, _parent));
				else _push(`<!---->`);
				_push(ssrRenderComponent(unref(Link), {
					href: "/chats",
					onClick: closeMenu
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`Чаты`);
						else return [createTextVNode("Чаты")];
					}),
					_: 1
				}, _parent));
				_push(ssrRenderComponent(unref(Link), {
					href: "/profile/" + authUser.value.id,
					onClick: closeMenu
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`Профиль`);
						else return [createTextVNode("Профиль")];
					}),
					_: 1
				}, _parent));
				_push(ssrRenderComponent(unref(Link), {
					href: "/balance",
					onClick: closeMenu
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) {
							_push(` Баланс: ${ssrInterpolate(authUser.value.balance)} ₽ `);
							if (authUser.value.hasPendingTransactions) _push(`<span class="pending-badge" data-v-20f57fe6${_scopeId}>Ожидание...</span>`);
							else _push(`<!---->`);
						} else return [createTextVNode(" Баланс: " + toDisplayString(authUser.value.balance) + " ₽ ", 1), authUser.value.hasPendingTransactions ? (openBlock(), createBlock("span", {
							key: 0,
							class: "pending-badge"
						}, "Ожидание...")) : createCommentVNode("", true)];
					}),
					_: 1
				}, _parent));
				_push(ssrRenderComponent(unref(Link), {
					href: "/notifications",
					onClick: closeMenu
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`Уведомления`);
						else return [createTextVNode("Уведомления")];
					}),
					_: 1
				}, _parent));
				_push(ssrRenderComponent(unref(Link), {
					href: "/settings",
					onClick: closeMenu
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`Настройки`);
						else return [createTextVNode("Настройки")];
					}),
					_: 1
				}, _parent));
				_push(`<div class="mobile-menu-footer" data-v-20f57fe6><button type="button" data-v-20f57fe6>Выйти</button></div><!--]-->`);
			} else _push(ssrRenderComponent(unref(Link), {
				href: "/login",
				onClick: closeMenu
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`Войти`);
					else return [createTextVNode("Войти")];
				}),
				_: 1
			}, _parent));
			_push(`</div><main class="${ssrRenderClass(mainClass.value)}" data-v-20f57fe6>`);
			ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
			_push(`</main><footer class="${ssrRenderClass(footerClass.value)}" data-v-20f57fe6><div data-v-20f57fe6><a data-v-20f57fe6>Адрес компании</a><a data-v-20f57fe6>Телефонный номер</a><a data-v-20f57fe6>Электронная почта</a></div><div data-v-20f57fe6><a data-v-20f57fe6>О нас</a><a data-v-20f57fe6>Услуги или продукты</a><a data-v-20f57fe6>Часто задаваемые вопросы (FAQ)</a></div><div data-v-20f57fe6><a data-v-20f57fe6>Политика конфиденциальности</a><a data-v-20f57fe6>Условия использования</a><a data-v-20f57fe6>© 2025 Все права защищены.</a></div></footer></div>`);
		};
	}
};
var _sfc_setup$22 = _sfc_main$22.setup;
_sfc_main$22.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Layouts/AppLayout.vue");
	return _sfc_setup$22 ? _sfc_setup$22(props, ctx) : void 0;
};
var AppLayout_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$22, [["__scopeId", "data-v-20f57fe6"]]);
//#endregion
//#region resources/js/Pages/Admin/Comments.vue
var Comments_exports = /* @__PURE__ */ __exportAll({ default: () => Comments_default });
var DEFAULT_AVATAR$1 = "/images/User-avatar.png";
var _sfc_main$21 = {
	__name: "Comments",
	__ssrInlineRender: true,
	props: { mode: {
		type: String,
		default: "comments"
	} },
	setup(__props) {
		const props = __props;
		useDarkMode();
		let adminLink = null;
		let adminScript = null;
		const comments = ref([]);
		const searchQuery = ref("");
		const loading = ref(true);
		const error = ref(null);
		const deleting = ref(null);
		const openReports = ref({});
		const mode = computed(() => props.mode || "comments");
		const filteredComments = computed(() => {
			if (!searchQuery.value) return comments.value;
			const query = searchQuery.value.toLowerCase();
			return comments.value.filter((comment) => comment.text.toLowerCase().includes(query) || comment.user?.name.toLowerCase().includes(query) || comment.post?.title.toLowerCase().includes(query));
		});
		const fetchComments = async () => {
			try {
				loading.value = true;
				error.value = null;
				let params = "";
				if (mode.value === "reports") params = "?mode=reports";
				const response = await axios$1.get(`/admin/comments/data${params}`);
				comments.value = response.data.comments || response.data;
			} catch (err) {
				console.error("Ошибка загрузки комментариев:", err);
				error.value = "Не удалось загрузить комментарии";
			} finally {
				loading.value = false;
			}
		};
		const getUserAvatar = (user) => {
			if (user?.avatar) return `/storage/${user.avatar}`;
			return DEFAULT_AVATAR$1;
		};
		const handleImageError = (event) => {
			event.target.src = DEFAULT_AVATAR$1;
		};
		const formatDate = (dateString) => {
			if (!dateString) return "";
			const date = new Date(dateString);
			const diffInSeconds = Math.floor((/* @__PURE__ */ new Date() - date) / 1e3);
			if (diffInSeconds < 60) return "только что";
			const diffInMinutes = Math.floor(diffInSeconds / 60);
			if (diffInMinutes < 60) return `${diffInMinutes} ${pluralize(diffInMinutes, "минуту", "минуты", "минут")} назад`;
			const diffInHours = Math.floor(diffInMinutes / 60);
			if (diffInHours < 24) return `${diffInHours} ${pluralize(diffInHours, "час", "часа", "часов")} назад`;
			const diffInDays = Math.floor(diffInHours / 24);
			if (diffInDays < 7) return `${diffInDays} ${pluralize(diffInDays, "день", "дня", "дней")} назад`;
			const diffInWeeks = Math.floor(diffInDays / 7);
			if (diffInWeeks < 4) return `${diffInWeeks} ${pluralize(diffInWeeks, "неделю", "недели", "недель")} назад`;
			const diffInMonths = Math.floor(diffInDays / 30);
			if (diffInMonths < 12) return `${diffInMonths} ${pluralize(diffInMonths, "месяц", "месяца", "месяцев")} назад`;
			const diffInYears = Math.floor(diffInDays / 365);
			return `${diffInYears} ${pluralize(diffInYears, "год", "года", "лет")} назад`;
		};
		const pluralize = (number, one, few, many) => {
			const mod10 = number % 10;
			const mod100 = number % 100;
			if (mod10 === 1 && mod100 !== 11) return one;
			if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
			return many;
		};
		const deleteComment = async (commentId) => {
			if (!confirm("Вы уверены, что хотите удалить этот комментарий?")) return;
			try {
				deleting.value = commentId;
				await axios$1.delete(`/admin/comments/${commentId}`);
				comments.value = comments.value.filter((comment) => comment.id !== commentId);
				alert("Комментарий успешно удален");
			} catch (err) {
				console.error("Ошибка удаления комментария:", err);
				alert("Не удалось удалить комментарий");
			} finally {
				deleting.value = null;
			}
		};
		const toggleReports = (commentId) => {
			openReports.value[commentId] = !openReports.value[commentId];
		};
		const dismissCommentReports = async (commentId) => {
			try {
				deleting.value = commentId;
				await axios$1.post(`/admin/comments/${commentId}/dismiss-reports`);
				comments.value = comments.value.filter((comment) => comment.id !== commentId);
			} catch (err) {
				console.error("Ошибка игнорирования жалоб:", err);
				alert("Не удалось игнорировать жалобы");
			} finally {
				deleting.value = null;
			}
		};
		const formatReportDate = (dateString) => {
			if (!dateString) return "";
			return new Date(dateString).toLocaleDateString("ru-RU", {
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit"
			});
		};
		const handleSearch = () => {};
		onMounted(() => {
			adminLink = document.createElement("link");
			adminLink.rel = "stylesheet";
			adminLink.href = "/css/admin.css";
			document.head.appendChild(adminLink);
			adminScript = document.createElement("script");
			adminScript.src = "/js/admin.js";
			document.body.appendChild(adminScript);
			fetchComments();
		});
		onUnmounted(() => {
			if (adminLink) {
				document.head.removeChild(adminLink);
				adminLink = null;
			}
			if (adminScript) {
				document.body.removeChild(adminScript);
				adminScript = null;
			}
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(AppLayout_default, _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="admin-container" data-v-7c3b66bc${_scopeId}><h1 data-v-7c3b66bc${_scopeId}>${ssrInterpolate(mode.value === "reports" ? "Жалобы на комментарии" : "Управление комментариями")}</h1><div class="admin-nav" data-v-7c3b66bc${_scopeId}>`);
						_push(ssrRenderComponent(unref(Link), {
							href: "/admin",
							class: "admin-nav-item"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Главная `);
								else return [createTextVNode(" Главная ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(Link), {
							href: "/admin/users",
							class: "admin-nav-item"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Пользователи `);
								else return [createTextVNode(" Пользователи ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(Link), {
							href: "/admin/posts",
							class: "admin-nav-item"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Посты `);
								else return [createTextVNode(" Посты ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(Link), {
							href: mode.value === "reports" ? "/admin/comments?mode=reports" : "/admin/comments",
							class: ["admin-nav-item", { active: mode.value !== "reports" }]
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Комментарии `);
								else return [createTextVNode(" Комментарии ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div><div class="search-container" data-v-7c3b66bc${_scopeId}><input type="text" id="commentSearch"${ssrRenderAttr("value", searchQuery.value)} placeholder="Поиск комментария..." data-v-7c3b66bc${_scopeId}></div>`);
						if (loading.value) _push(`<div class="loading" data-v-7c3b66bc${_scopeId}> Загрузка... </div>`);
						else if (error.value) _push(`<div class="error" data-v-7c3b66bc${_scopeId}>${ssrInterpolate(error.value)}</div>`);
						else {
							_push(`<div class="comments-list" data-v-7c3b66bc${_scopeId}><!--[-->`);
							ssrRenderList(filteredComments.value, (comment) => {
								_push(`<div class="comment-item" data-v-7c3b66bc${_scopeId}><div class="comment-info" data-v-7c3b66bc${_scopeId}><div class="comment-header" data-v-7c3b66bc${_scopeId}><img${ssrRenderAttr("src", getUserAvatar(comment.user))}${ssrRenderAttr("alt", comment.user?.name)} class="comment-avatar" data-v-7c3b66bc${_scopeId}><div data-v-7c3b66bc${_scopeId}><h3 data-v-7c3b66bc${_scopeId}>${ssrInterpolate(comment.user?.name || "Неизвестный пользователь")}</h3><small data-v-7c3b66bc${_scopeId}>${ssrInterpolate(formatDate(comment.created_at))}</small></div></div><p data-v-7c3b66bc${_scopeId}>${ssrInterpolate(comment.text)}</p><small data-v-7c3b66bc${_scopeId}>К посту: ${ssrInterpolate(comment.post?.title || "Пост удален")}</small>`);
								if (mode.value === "reports" && comment.reports?.length) {
									_push(`<div class="reports-info" data-v-7c3b66bc${_scopeId}><p class="reports-count" data-v-7c3b66bc${_scopeId}>Жалоб: ${ssrInterpolate(comment.reports.length)}</p><button class="attempts-toggle" data-v-7c3b66bc${_scopeId}> Подробнее <span class="${ssrRenderClass([{ open: openReports.value[comment.id] }, "arrow"])}" data-v-7c3b66bc${_scopeId}>▼</span></button>`);
									if (openReports.value[comment.id]) {
										_push(`<div class="rejections-dropdown" data-v-7c3b66bc${_scopeId}><!--[-->`);
										ssrRenderList(comment.reports, (report) => {
											_push(`<div class="rejection-item" data-v-7c3b66bc${_scopeId}><div class="rejection-date" data-v-7c3b66bc${_scopeId}>${ssrInterpolate(formatReportDate(report.created_at))}</div><div class="rejection-reason" data-v-7c3b66bc${_scopeId}>${ssrInterpolate(report.reason)}</div><div class="reporter-info" data-v-7c3b66bc${_scopeId}>От: ${ssrInterpolate(report.reporter?.name || "Неизвестный")}</div></div>`);
										});
										_push(`<!--]--></div>`);
									} else _push(`<!---->`);
									_push(`</div>`);
								} else _push(`<!---->`);
								_push(`</div><div class="comment-actions" data-v-7c3b66bc${_scopeId}>`);
								if (comment.post) _push(ssrRenderComponent(unref(Link), {
									href: `/posts/${comment.post.id}`,
									class: "btn"
								}, {
									default: withCtx((_, _push, _parent, _scopeId) => {
										if (_push) _push(` К посту `);
										else return [createTextVNode(" К посту ")];
									}),
									_: 2
								}, _parent, _scopeId));
								else _push(`<!---->`);
								if (mode.value === "reports") _push(`<!--[--><button class="btn btn-dismiss"${ssrIncludeBooleanAttr(deleting.value === comment.id) ? " disabled" : ""} data-v-7c3b66bc${_scopeId}>${ssrInterpolate(deleting.value === comment.id ? "..." : "Игнорировать")}</button><button class="btn btn-danger"${ssrIncludeBooleanAttr(deleting.value === comment.id) ? " disabled" : ""} data-v-7c3b66bc${_scopeId}> Удалить </button><!--]-->`);
								else _push(`<button class="btn btn-danger"${ssrIncludeBooleanAttr(deleting.value === comment.id) ? " disabled" : ""} data-v-7c3b66bc${_scopeId}>${ssrInterpolate(deleting.value === comment.id ? "Удаление..." : "Удалить")}</button>`);
								_push(`</div></div>`);
							});
							_push(`<!--]-->`);
							if (filteredComments.value.length === 0) _push(`<div class="no-results" data-v-7c3b66bc${_scopeId}>${ssrInterpolate(mode.value === "reports" ? "Нет жалоб на комментарии" : "Комментарии не найдены")}</div>`);
							else _push(`<!---->`);
							_push(`</div>`);
						}
						_push(`</div>`);
					} else return [createVNode("div", { class: "admin-container" }, [
						createVNode("h1", null, toDisplayString(mode.value === "reports" ? "Жалобы на комментарии" : "Управление комментариями"), 1),
						createVNode("div", { class: "admin-nav" }, [
							createVNode(unref(Link), {
								href: "/admin",
								class: "admin-nav-item"
							}, {
								default: withCtx(() => [createTextVNode(" Главная ")]),
								_: 1
							}),
							createVNode(unref(Link), {
								href: "/admin/users",
								class: "admin-nav-item"
							}, {
								default: withCtx(() => [createTextVNode(" Пользователи ")]),
								_: 1
							}),
							createVNode(unref(Link), {
								href: "/admin/posts",
								class: "admin-nav-item"
							}, {
								default: withCtx(() => [createTextVNode(" Посты ")]),
								_: 1
							}),
							createVNode(unref(Link), {
								href: mode.value === "reports" ? "/admin/comments?mode=reports" : "/admin/comments",
								class: ["admin-nav-item", { active: mode.value !== "reports" }]
							}, {
								default: withCtx(() => [createTextVNode(" Комментарии ")]),
								_: 1
							}, 8, ["href", "class"])
						]),
						createVNode("div", { class: "search-container" }, [withDirectives(createVNode("input", {
							type: "text",
							id: "commentSearch",
							"onUpdate:modelValue": ($event) => searchQuery.value = $event,
							placeholder: "Поиск комментария...",
							onInput: handleSearch
						}, null, 40, ["onUpdate:modelValue"]), [[vModelText, searchQuery.value]])]),
						loading.value ? (openBlock(), createBlock("div", {
							key: 0,
							class: "loading"
						}, " Загрузка... ")) : error.value ? (openBlock(), createBlock("div", {
							key: 1,
							class: "error"
						}, toDisplayString(error.value), 1)) : (openBlock(), createBlock("div", {
							key: 2,
							class: "comments-list"
						}, [(openBlock(true), createBlock(Fragment, null, renderList(filteredComments.value, (comment) => {
							return openBlock(), createBlock("div", {
								key: comment.id,
								class: "comment-item"
							}, [createVNode("div", { class: "comment-info" }, [
								createVNode("div", { class: "comment-header" }, [createVNode("img", {
									src: getUserAvatar(comment.user),
									alt: comment.user?.name,
									class: "comment-avatar",
									onError: handleImageError
								}, null, 40, ["src", "alt"]), createVNode("div", null, [createVNode("h3", null, toDisplayString(comment.user?.name || "Неизвестный пользователь"), 1), createVNode("small", null, toDisplayString(formatDate(comment.created_at)), 1)])]),
								createVNode("p", null, toDisplayString(comment.text), 1),
								createVNode("small", null, "К посту: " + toDisplayString(comment.post?.title || "Пост удален"), 1),
								mode.value === "reports" && comment.reports?.length ? (openBlock(), createBlock("div", {
									key: 0,
									class: "reports-info"
								}, [
									createVNode("p", { class: "reports-count" }, "Жалоб: " + toDisplayString(comment.reports.length), 1),
									createVNode("button", {
										class: "attempts-toggle",
										onClick: ($event) => toggleReports(comment.id)
									}, [createTextVNode(" Подробнее "), createVNode("span", { class: ["arrow", { open: openReports.value[comment.id] }] }, "▼", 2)], 8, ["onClick"]),
									openReports.value[comment.id] ? (openBlock(), createBlock("div", {
										key: 0,
										class: "rejections-dropdown"
									}, [(openBlock(true), createBlock(Fragment, null, renderList(comment.reports, (report) => {
										return openBlock(), createBlock("div", {
											key: report.id,
											class: "rejection-item"
										}, [
											createVNode("div", { class: "rejection-date" }, toDisplayString(formatReportDate(report.created_at)), 1),
											createVNode("div", { class: "rejection-reason" }, toDisplayString(report.reason), 1),
											createVNode("div", { class: "reporter-info" }, "От: " + toDisplayString(report.reporter?.name || "Неизвестный"), 1)
										]);
									}), 128))])) : createCommentVNode("", true)
								])) : createCommentVNode("", true)
							]), createVNode("div", { class: "comment-actions" }, [comment.post ? (openBlock(), createBlock(unref(Link), {
								key: 0,
								href: `/posts/${comment.post.id}`,
								class: "btn"
							}, {
								default: withCtx(() => [createTextVNode(" К посту ")]),
								_: 1
							}, 8, ["href"])) : createCommentVNode("", true), mode.value === "reports" ? (openBlock(), createBlock(Fragment, { key: 1 }, [createVNode("button", {
								onClick: ($event) => dismissCommentReports(comment.id),
								class: "btn btn-dismiss",
								disabled: deleting.value === comment.id
							}, toDisplayString(deleting.value === comment.id ? "..." : "Игнорировать"), 9, ["onClick", "disabled"]), createVNode("button", {
								onClick: ($event) => deleteComment(comment.id),
								class: "btn btn-danger",
								disabled: deleting.value === comment.id
							}, " Удалить ", 8, ["onClick", "disabled"])], 64)) : (openBlock(), createBlock("button", {
								key: 2,
								onClick: ($event) => deleteComment(comment.id),
								class: "btn btn-danger",
								disabled: deleting.value === comment.id
							}, toDisplayString(deleting.value === comment.id ? "Удаление..." : "Удалить"), 9, ["onClick", "disabled"]))])]);
						}), 128)), filteredComments.value.length === 0 ? (openBlock(), createBlock("div", {
							key: 0,
							class: "no-results"
						}, toDisplayString(mode.value === "reports" ? "Нет жалоб на комментарии" : "Комментарии не найдены"), 1)) : createCommentVNode("", true)]))
					])];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup$21 = _sfc_main$21.setup;
_sfc_main$21.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Admin/Comments.vue");
	return _sfc_setup$21 ? _sfc_setup$21(props, ctx) : void 0;
};
var Comments_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$21, [["__scopeId", "data-v-7c3b66bc"]]);
//#endregion
//#region resources/js/Pages/Admin/Index.vue
var Index_exports$3 = /* @__PURE__ */ __exportAll({ default: () => Index_default$3 });
var _sfc_main$20 = {
	__name: "Index",
	__ssrInlineRender: true,
	props: {
		pendingVerificationCount: {
			type: Number,
			default: 0
		},
		usersReportCount: {
			type: Number,
			default: 0
		},
		postsReportCount: {
			type: Number,
			default: 0
		},
		commentsReportCount: {
			type: Number,
			default: 0
		},
		disputesCount: {
			type: Number,
			default: 0
		}
	},
	setup(__props) {
		const pendingCount = ref(__props.pendingVerificationCount || 0);
		useDarkMode();
		let adminLink = null;
		onMounted(() => {
			adminLink = document.createElement("link");
			adminLink.rel = "stylesheet";
			adminLink.href = "/css/admin.css";
			document.head.appendChild(adminLink);
		});
		onUnmounted(() => {
			if (adminLink) {
				document.head.removeChild(adminLink);
				adminLink = null;
			}
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(AppLayout_default, _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="admin-container" data-v-04d997f9${_scopeId}><h1 data-v-04d997f9${_scopeId}>Админ панель</h1><div class="admin-nav" data-v-04d997f9${_scopeId}>`);
						_push(ssrRenderComponent(unref(Link), {
							href: "/admin",
							class: "admin-nav-item active"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Главная `);
								else return [createTextVNode(" Главная ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(Link), {
							href: "/admin/users",
							class: "admin-nav-item"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Пользователи `);
								else return [createTextVNode(" Пользователи ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(Link), {
							href: "/admin/posts",
							class: "admin-nav-item"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Посты `);
								else return [createTextVNode(" Посты ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(Link), {
							href: "/admin/comments",
							class: "admin-nav-item"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Комментарии `);
								else return [createTextVNode(" Комментарии ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(Link), {
							href: "/admin/disputes",
							class: "admin-nav-item"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(` Споры `);
									if (__props.disputesCount > 0) _push(`<span class="badge" data-v-04d997f9${_scopeId}>${ssrInterpolate(__props.disputesCount)}</span>`);
									else _push(`<!---->`);
								} else return [createTextVNode(" Споры "), __props.disputesCount > 0 ? (openBlock(), createBlock("span", {
									key: 0,
									class: "badge"
								}, toDisplayString(__props.disputesCount), 1)) : createCommentVNode("", true)];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div><h2 data-v-04d997f9${_scopeId}>Заявки</h2><div class="banner" data-v-04d997f9${_scopeId}>`);
						_push(ssrRenderComponent(unref(Link), {
							href: "/admin/verification-requests",
							class: "link"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Заявки на подтверждение аккаунта <span class="badge" data-v-04d997f9${_scopeId}>${ssrInterpolate(pendingCount.value)}</span>`);
								else return [createTextVNode(" Заявки на подтверждение аккаунта "), createVNode("span", { class: "badge" }, toDisplayString(pendingCount.value), 1)];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div><h2 data-v-04d997f9${_scopeId}>Репорты</h2><div class="banners" data-v-04d997f9${_scopeId}><div class="banner" data-v-04d997f9${_scopeId}>`);
						_push(ssrRenderComponent(unref(Link), {
							href: `/admin/users?mode=reports`,
							class: "link"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Пользователи <span class="badge" data-v-04d997f9${_scopeId}>${ssrInterpolate(__props.usersReportCount)}</span>`);
								else return [createTextVNode(" Пользователи "), createVNode("span", { class: "badge" }, toDisplayString(__props.usersReportCount), 1)];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div><div class="banner" data-v-04d997f9${_scopeId}>`);
						_push(ssrRenderComponent(unref(Link), {
							href: `/admin/posts?mode=reports`,
							class: "link"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Посты <span class="badge" data-v-04d997f9${_scopeId}>${ssrInterpolate(__props.postsReportCount)}</span>`);
								else return [createTextVNode(" Посты "), createVNode("span", { class: "badge" }, toDisplayString(__props.postsReportCount), 1)];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div><div class="banner" data-v-04d997f9${_scopeId}>`);
						_push(ssrRenderComponent(unref(Link), {
							href: `/admin/comments?mode=reports`,
							class: "link"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Комментарии <span class="badge" data-v-04d997f9${_scopeId}>${ssrInterpolate(__props.commentsReportCount)}</span>`);
								else return [createTextVNode(" Комментарии "), createVNode("span", { class: "badge" }, toDisplayString(__props.commentsReportCount), 1)];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div></div></div>`);
					} else return [createVNode("div", { class: "admin-container" }, [
						createVNode("h1", null, "Админ панель"),
						createVNode("div", { class: "admin-nav" }, [
							createVNode(unref(Link), {
								href: "/admin",
								class: "admin-nav-item active"
							}, {
								default: withCtx(() => [createTextVNode(" Главная ")]),
								_: 1
							}),
							createVNode(unref(Link), {
								href: "/admin/users",
								class: "admin-nav-item"
							}, {
								default: withCtx(() => [createTextVNode(" Пользователи ")]),
								_: 1
							}),
							createVNode(unref(Link), {
								href: "/admin/posts",
								class: "admin-nav-item"
							}, {
								default: withCtx(() => [createTextVNode(" Посты ")]),
								_: 1
							}),
							createVNode(unref(Link), {
								href: "/admin/comments",
								class: "admin-nav-item"
							}, {
								default: withCtx(() => [createTextVNode(" Комментарии ")]),
								_: 1
							}),
							createVNode(unref(Link), {
								href: "/admin/disputes",
								class: "admin-nav-item"
							}, {
								default: withCtx(() => [createTextVNode(" Споры "), __props.disputesCount > 0 ? (openBlock(), createBlock("span", {
									key: 0,
									class: "badge"
								}, toDisplayString(__props.disputesCount), 1)) : createCommentVNode("", true)]),
								_: 1
							})
						]),
						createVNode("h2", null, "Заявки"),
						createVNode("div", { class: "banner" }, [createVNode(unref(Link), {
							href: "/admin/verification-requests",
							class: "link"
						}, {
							default: withCtx(() => [createTextVNode(" Заявки на подтверждение аккаунта "), createVNode("span", { class: "badge" }, toDisplayString(pendingCount.value), 1)]),
							_: 1
						})]),
						createVNode("h2", null, "Репорты"),
						createVNode("div", { class: "banners" }, [
							createVNode("div", { class: "banner" }, [createVNode(unref(Link), {
								href: `/admin/users?mode=reports`,
								class: "link"
							}, {
								default: withCtx(() => [createTextVNode(" Пользователи "), createVNode("span", { class: "badge" }, toDisplayString(__props.usersReportCount), 1)]),
								_: 1
							})]),
							createVNode("div", { class: "banner" }, [createVNode(unref(Link), {
								href: `/admin/posts?mode=reports`,
								class: "link"
							}, {
								default: withCtx(() => [createTextVNode(" Посты "), createVNode("span", { class: "badge" }, toDisplayString(__props.postsReportCount), 1)]),
								_: 1
							})]),
							createVNode("div", { class: "banner" }, [createVNode(unref(Link), {
								href: `/admin/comments?mode=reports`,
								class: "link"
							}, {
								default: withCtx(() => [createTextVNode(" Комментарии "), createVNode("span", { class: "badge" }, toDisplayString(__props.commentsReportCount), 1)]),
								_: 1
							})])
						])
					])];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup$20 = _sfc_main$20.setup;
_sfc_main$20.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Admin/Index.vue");
	return _sfc_setup$20 ? _sfc_setup$20(props, ctx) : void 0;
};
var Index_default$3 = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$20, [["__scopeId", "data-v-04d997f9"]]);
//#endregion
//#region resources/js/Pages/Admin/Posts.vue
var Posts_exports = /* @__PURE__ */ __exportAll({ default: () => Posts_default });
var _sfc_main$19 = {
	__name: "Posts",
	__ssrInlineRender: true,
	props: { mode: {
		type: String,
		default: "posts"
	} },
	setup(__props) {
		const props = __props;
		useDarkMode();
		let adminLink = null;
		const mode = computed(() => props.mode || "posts");
		const posts = ref([]);
		const searchQuery = ref("");
		const loading = ref(true);
		const error = ref(null);
		const deleting = ref(null);
		const openReports = ref({});
		onMounted(() => {
			adminLink = document.createElement("link");
			adminLink.rel = "stylesheet";
			adminLink.href = "/css/admin.css";
			document.head.appendChild(adminLink);
		});
		onUnmounted(() => {
			if (adminLink) {
				document.head.removeChild(adminLink);
				adminLink = null;
			}
		});
		const filteredPosts = computed(() => {
			if (!searchQuery.value) return posts.value;
			const query = searchQuery.value.toLowerCase();
			return posts.value.filter((post) => post.title.toLowerCase().includes(query) || post.description.toLowerCase().includes(query) || post.user?.name.toLowerCase().includes(query));
		});
		const fetchPosts = async () => {
			try {
				loading.value = true;
				error.value = null;
				let params = "";
				if (mode.value === "reports") params = "?mode=reports";
				const response = await axios$1.get(`/admin/posts/data${params}`);
				posts.value = response.data.posts || response.data;
			} catch (err) {
				console.error("Ошибка загрузки постов:", err);
				error.value = "Не удалось загрузить посты";
			} finally {
				loading.value = false;
			}
		};
		const formatDate = (dateString) => {
			if (!dateString) return "";
			return new Date(dateString).toLocaleDateString("ru-RU", {
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit"
			});
		};
		const toggleReports = (postId) => {
			openReports.value[postId] = !openReports.value[postId];
		};
		const dismissPostReports = async (postId) => {
			try {
				deleting.value = postId;
				await axios$1.post(`/admin/posts/${postId}/dismiss-reports`);
				posts.value = posts.value.filter((post) => post.id !== postId);
			} catch (err) {
				console.error("Ошибка игнорирования жалоб:", err);
				alert("Не удалось игнорировать жалобы");
			} finally {
				deleting.value = null;
			}
		};
		const warnPost = async (postId) => {
			try {
				deleting.value = postId;
				await axios$1.post(`/admin/posts/${postId}/warn`);
				posts.value = posts.value.filter((post) => post.id !== postId);
				alert("Предупреждение отправлено");
			} catch (err) {
				console.error("Ошибка отправки предупреждения:", err);
				alert("Не удалось отправить предупреждение");
			} finally {
				deleting.value = null;
			}
		};
		const hidePost = async (postId) => {
			if (!confirm("Вы уверены, что хотите скрыть этот пост?")) return;
			try {
				deleting.value = postId;
				await axios$1.post(`/admin/posts/${postId}/hide`);
				posts.value = posts.value.filter((post) => post.id !== postId);
				alert("Пост скрыт");
			} catch (err) {
				console.error("Ошибка скрытия поста:", err);
				alert("Не удалось скрыть пост");
			} finally {
				deleting.value = null;
			}
		};
		const deletePost = async (postId) => {
			if (!confirm("Вы уверены, что хотите удалить этот пост?")) return;
			try {
				deleting.value = postId;
				await axios$1.delete(`/admin/posts/${postId}`);
				posts.value = posts.value.filter((post) => post.id !== postId);
				alert("Пост успешно удален");
			} catch (err) {
				console.error("Ошибка удаления поста:", err);
				alert("Не удалось удалить пост");
			} finally {
				deleting.value = null;
			}
		};
		const handleSearch = () => {};
		onMounted(() => {
			const script = document.createElement("script");
			script.src = "/js/admin.js";
			document.body.appendChild(script);
			fetchPosts();
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(AppLayout_default, _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="admin-container" data-v-96aae5b8${_scopeId}><h1 data-v-96aae5b8${_scopeId}>${ssrInterpolate(mode.value === "reports" ? "Жалобы на посты" : "Управление постами")}</h1><div class="admin-nav" data-v-96aae5b8${_scopeId}>`);
						_push(ssrRenderComponent(unref(Link), {
							href: "/admin",
							class: "admin-nav-item"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Главная `);
								else return [createTextVNode(" Главная ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(Link), {
							href: "/admin/users",
							class: "admin-nav-item"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Пользователи `);
								else return [createTextVNode(" Пользователи ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(Link), {
							href: mode.value === "reports" ? "/admin/posts?mode=reports" : "/admin/posts",
							class: "admin-nav-item active"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Посты `);
								else return [createTextVNode(" Посты ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(Link), {
							href: "/admin/comments",
							class: "admin-nav-item"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Комментарии `);
								else return [createTextVNode(" Комментарии ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div><div class="search-container" data-v-96aae5b8${_scopeId}><input type="text" id="postSearch"${ssrRenderAttr("value", searchQuery.value)} placeholder="Поиск поста..." data-v-96aae5b8${_scopeId}></div>`);
						if (loading.value) _push(`<div class="loading" data-v-96aae5b8${_scopeId}> Загрузка... </div>`);
						else if (error.value) _push(`<div class="error" data-v-96aae5b8${_scopeId}>${ssrInterpolate(error.value)}</div>`);
						else {
							_push(`<div class="posts-list" data-v-96aae5b8${_scopeId}><!--[-->`);
							ssrRenderList(filteredPosts.value, (post) => {
								_push(`<div class="post-item" data-v-96aae5b8${_scopeId}><img${ssrRenderAttr("src", `/storage/${post.image}`)}${ssrRenderAttr("alt", post.title)} class="post-image" data-v-96aae5b8${_scopeId}><div class="post-info" data-v-96aae5b8${_scopeId}><h3 data-v-96aae5b8${_scopeId}>${ssrInterpolate(post.title)}</h3><p data-v-96aae5b8${_scopeId}>${ssrInterpolate(post.description)}</p><small data-v-96aae5b8${_scopeId}>Автор: ${ssrInterpolate(post.user?.name)}</small>`);
								if (mode.value === "reports" && post.reports?.length) {
									_push(`<div class="reports-info" data-v-96aae5b8${_scopeId}><p class="reports-count" data-v-96aae5b8${_scopeId}>Жалоб: ${ssrInterpolate(post.reports.length)}</p><button class="attempts-toggle" data-v-96aae5b8${_scopeId}> Подробнее <span class="${ssrRenderClass([{ open: openReports.value[post.id] }, "arrow"])}" data-v-96aae5b8${_scopeId}>▼</span></button>`);
									if (openReports.value[post.id]) {
										_push(`<div class="rejections-dropdown" data-v-96aae5b8${_scopeId}><!--[-->`);
										ssrRenderList(post.reports, (report) => {
											_push(`<div class="rejection-item" data-v-96aae5b8${_scopeId}><div class="rejection-date" data-v-96aae5b8${_scopeId}>${ssrInterpolate(formatDate(report.created_at))}</div><div class="rejection-reason" data-v-96aae5b8${_scopeId}>${ssrInterpolate(report.reason)}</div>`);
											if (report.reporter) _push(ssrRenderComponent(unref(Link), {
												href: `/profile/${report.reporter.id}`,
												class: "reporter-info"
											}, {
												default: withCtx((_, _push, _parent, _scopeId) => {
													if (_push) _push(` От: ${ssrInterpolate(report.reporter.name)}`);
													else return [createTextVNode(" От: " + toDisplayString(report.reporter.name), 1)];
												}),
												_: 2
											}, _parent, _scopeId));
											else _push(`<div class="reporter-info" data-v-96aae5b8${_scopeId}>От: Неизвестный</div>`);
											_push(`</div>`);
										});
										_push(`<!--]--></div>`);
									} else _push(`<!---->`);
									_push(`</div>`);
								} else _push(`<!---->`);
								_push(`</div><div class="post-actions" data-v-96aae5b8${_scopeId}>`);
								_push(ssrRenderComponent(unref(Link), {
									href: `/posts/${post.id}`,
									class: "btn"
								}, {
									default: withCtx((_, _push, _parent, _scopeId) => {
										if (_push) _push(` Просмотр `);
										else return [createTextVNode(" Просмотр ")];
									}),
									_: 2
								}, _parent, _scopeId));
								if (mode.value === "reports") _push(`<!--[--><button class="btn btn-dismiss"${ssrIncludeBooleanAttr(deleting.value === post.id) ? " disabled" : ""} data-v-96aae5b8${_scopeId}>${ssrInterpolate(deleting.value === post.id ? "..." : "Игнорировать")}</button><button class="btn btn-warn"${ssrIncludeBooleanAttr(deleting.value === post.id) ? " disabled" : ""} data-v-96aae5b8${_scopeId}> Предупреждение </button><button class="btn btn-danger"${ssrIncludeBooleanAttr(deleting.value === post.id) ? " disabled" : ""} data-v-96aae5b8${_scopeId}> Скрыть </button><!--]-->`);
								else _push(`<button class="btn btn-danger"${ssrIncludeBooleanAttr(deleting.value === post.id) ? " disabled" : ""} data-v-96aae5b8${_scopeId}>${ssrInterpolate(deleting.value === post.id ? "Удаление..." : "Удалить")}</button>`);
								_push(`</div></div>`);
							});
							_push(`<!--]-->`);
							if (filteredPosts.value.length === 0) _push(`<div class="no-results" data-v-96aae5b8${_scopeId}>${ssrInterpolate(mode.value === "reports" ? "Нет жалоб на посты" : "Посты не найдены")}</div>`);
							else _push(`<!---->`);
							_push(`</div>`);
						}
						_push(`</div>`);
					} else return [createVNode("div", { class: "admin-container" }, [
						createVNode("h1", null, toDisplayString(mode.value === "reports" ? "Жалобы на посты" : "Управление постами"), 1),
						createVNode("div", { class: "admin-nav" }, [
							createVNode(unref(Link), {
								href: "/admin",
								class: "admin-nav-item"
							}, {
								default: withCtx(() => [createTextVNode(" Главная ")]),
								_: 1
							}),
							createVNode(unref(Link), {
								href: "/admin/users",
								class: "admin-nav-item"
							}, {
								default: withCtx(() => [createTextVNode(" Пользователи ")]),
								_: 1
							}),
							createVNode(unref(Link), {
								href: mode.value === "reports" ? "/admin/posts?mode=reports" : "/admin/posts",
								class: "admin-nav-item active"
							}, {
								default: withCtx(() => [createTextVNode(" Посты ")]),
								_: 1
							}, 8, ["href"]),
							createVNode(unref(Link), {
								href: "/admin/comments",
								class: "admin-nav-item"
							}, {
								default: withCtx(() => [createTextVNode(" Комментарии ")]),
								_: 1
							})
						]),
						createVNode("div", { class: "search-container" }, [withDirectives(createVNode("input", {
							type: "text",
							id: "postSearch",
							"onUpdate:modelValue": ($event) => searchQuery.value = $event,
							placeholder: "Поиск поста...",
							onInput: handleSearch
						}, null, 40, ["onUpdate:modelValue"]), [[vModelText, searchQuery.value]])]),
						loading.value ? (openBlock(), createBlock("div", {
							key: 0,
							class: "loading"
						}, " Загрузка... ")) : error.value ? (openBlock(), createBlock("div", {
							key: 1,
							class: "error"
						}, toDisplayString(error.value), 1)) : (openBlock(), createBlock("div", {
							key: 2,
							class: "posts-list"
						}, [(openBlock(true), createBlock(Fragment, null, renderList(filteredPosts.value, (post) => {
							return openBlock(), createBlock("div", {
								key: post.id,
								class: "post-item"
							}, [
								createVNode("img", {
									src: `/storage/${post.image}`,
									alt: post.title,
									class: "post-image"
								}, null, 8, ["src", "alt"]),
								createVNode("div", { class: "post-info" }, [
									createVNode("h3", null, toDisplayString(post.title), 1),
									createVNode("p", null, toDisplayString(post.description), 1),
									createVNode("small", null, "Автор: " + toDisplayString(post.user?.name), 1),
									mode.value === "reports" && post.reports?.length ? (openBlock(), createBlock("div", {
										key: 0,
										class: "reports-info"
									}, [
										createVNode("p", { class: "reports-count" }, "Жалоб: " + toDisplayString(post.reports.length), 1),
										createVNode("button", {
											class: "attempts-toggle",
											onClick: ($event) => toggleReports(post.id)
										}, [createTextVNode(" Подробнее "), createVNode("span", { class: ["arrow", { open: openReports.value[post.id] }] }, "▼", 2)], 8, ["onClick"]),
										openReports.value[post.id] ? (openBlock(), createBlock("div", {
											key: 0,
											class: "rejections-dropdown"
										}, [(openBlock(true), createBlock(Fragment, null, renderList(post.reports, (report) => {
											return openBlock(), createBlock("div", {
												key: report.id,
												class: "rejection-item"
											}, [
												createVNode("div", { class: "rejection-date" }, toDisplayString(formatDate(report.created_at)), 1),
												createVNode("div", { class: "rejection-reason" }, toDisplayString(report.reason), 1),
												report.reporter ? (openBlock(), createBlock(unref(Link), {
													key: 0,
													href: `/profile/${report.reporter.id}`,
													class: "reporter-info"
												}, {
													default: withCtx(() => [createTextVNode(" От: " + toDisplayString(report.reporter.name), 1)]),
													_: 2
												}, 1032, ["href"])) : (openBlock(), createBlock("div", {
													key: 1,
													class: "reporter-info"
												}, "От: Неизвестный"))
											]);
										}), 128))])) : createCommentVNode("", true)
									])) : createCommentVNode("", true)
								]),
								createVNode("div", { class: "post-actions" }, [createVNode(unref(Link), {
									href: `/posts/${post.id}`,
									class: "btn"
								}, {
									default: withCtx(() => [createTextVNode(" Просмотр ")]),
									_: 1
								}, 8, ["href"]), mode.value === "reports" ? (openBlock(), createBlock(Fragment, { key: 0 }, [
									createVNode("button", {
										onClick: ($event) => dismissPostReports(post.id),
										class: "btn btn-dismiss",
										disabled: deleting.value === post.id
									}, toDisplayString(deleting.value === post.id ? "..." : "Игнорировать"), 9, ["onClick", "disabled"]),
									createVNode("button", {
										onClick: ($event) => warnPost(post.id),
										class: "btn btn-warn",
										disabled: deleting.value === post.id
									}, " Предупреждение ", 8, ["onClick", "disabled"]),
									createVNode("button", {
										onClick: ($event) => hidePost(post.id),
										class: "btn btn-danger",
										disabled: deleting.value === post.id
									}, " Скрыть ", 8, ["onClick", "disabled"])
								], 64)) : (openBlock(), createBlock("button", {
									key: 1,
									onClick: ($event) => deletePost(post.id),
									class: "btn btn-danger",
									disabled: deleting.value === post.id
								}, toDisplayString(deleting.value === post.id ? "Удаление..." : "Удалить"), 9, ["onClick", "disabled"]))])
							]);
						}), 128)), filteredPosts.value.length === 0 ? (openBlock(), createBlock("div", {
							key: 0,
							class: "no-results"
						}, toDisplayString(mode.value === "reports" ? "Нет жалоб на посты" : "Посты не найдены"), 1)) : createCommentVNode("", true)]))
					])];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup$19 = _sfc_main$19.setup;
_sfc_main$19.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Admin/Posts.vue");
	return _sfc_setup$19 ? _sfc_setup$19(props, ctx) : void 0;
};
var Posts_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$19, [["__scopeId", "data-v-96aae5b8"]]);
//#endregion
//#region resources/js/Pages/Admin/Users.vue
var Users_exports = /* @__PURE__ */ __exportAll({ default: () => Users_default });
var DEFAULT_AVATAR = "/images/User-avatar.png";
var _sfc_main$18 = {
	__name: "Users",
	__ssrInlineRender: true,
	props: { mode: {
		type: String,
		default: "users"
	} },
	setup(__props) {
		const props = __props;
		useDarkMode();
		let adminLink = null;
		let adminScript = null;
		const users = ref([]);
		const searchQuery = ref("");
		const loading = ref(true);
		const error = ref(null);
		const sendingMessage = ref(null);
		const processingUser = ref(null);
		const rejectingUserId = ref(null);
		const rejectionReason = ref("");
		const pendingCount = ref(0);
		const openRejections = ref({});
		const openReports = ref({});
		const mode = computed(() => props.mode || "users");
		const getPageTitle = () => {
			if (mode.value === "verification") return "Список заявок на получение подтвержденного аккаунта";
			if (mode.value === "reports") return "Жалобы на пользователей";
			return "Управление пользователями";
		};
		const filteredUsers = computed(() => {
			if (!searchQuery.value) return users.value;
			const query = searchQuery.value.toLowerCase();
			return users.value.filter((user) => user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query));
		});
		const fetchUsers = async () => {
			try {
				loading.value = true;
				error.value = null;
				let params = "";
				if (mode.value === "verification") params = "?mode=verification";
				else if (mode.value === "reports") params = "?mode=reports";
				const response = await axios$1.get(`/admin/users/data${params}`);
				users.value = response.data.users || response.data;
				if (mode.value === "verification") pendingCount.value = users.value.length;
			} catch (err) {
				console.error("Ошибка загрузки пользователей:", err);
				error.value = "Не удалось загрузить пользователей";
			} finally {
				loading.value = false;
			}
		};
		const getUserAvatar = (user) => {
			if (user.avatar) return `/storage/${user.avatar}`;
			return DEFAULT_AVATAR;
		};
		const handleImageError = (event) => {
			event.target.src = DEFAULT_AVATAR;
		};
		const startConversation = async (userId) => {
			try {
				sendingMessage.value = userId;
				const response = await axios$1.get(`/chats/start/${userId}`);
				if (response.data.conversation_id) router.visit(`/messages/${response.data.conversation_id}`);
				else router.visit("/messages");
			} catch (err) {
				console.error("Ошибка создания диалога:", err);
				alert("Не удалось начать диалог");
			} finally {
				sendingMessage.value = null;
			}
		};
		const toggleRejections = (userId) => {
			openRejections.value[userId] = !openRejections.value[userId];
		};
		const formatDate = (dateString) => {
			return new Date(dateString).toLocaleDateString("ru-RU", {
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit"
			});
		};
		const approveUser = async (userId) => {
			try {
				processingUser.value = userId;
				await axios$1.post(`/admin/users/${userId}/approve`);
				users.value = users.value.filter((u) => u.id !== userId);
				pendingCount.value = Math.max(0, pendingCount.value - 1);
			} catch (err) {
				console.error("Ошибка одобрения:", err);
				alert("Не удалось одобрить заявку");
			} finally {
				processingUser.value = null;
			}
		};
		const showRejectModal = (userId) => {
			rejectingUserId.value = userId;
			rejectionReason.value = "";
		};
		const closeRejectModal = () => {
			rejectingUserId.value = null;
			rejectionReason.value = "";
		};
		const confirmReject = async () => {
			if (!rejectionReason.value.trim()) return;
			try {
				processingUser.value = rejectingUserId.value;
				await axios$1.post(`/admin/users/${rejectingUserId.value}/reject`, { reason: rejectionReason.value });
				users.value = users.value.filter((u) => u.id !== rejectingUserId.value);
				pendingCount.value = Math.max(0, pendingCount.value - 1);
				closeRejectModal();
			} catch (err) {
				console.error("Ошибка отказа:", err);
				alert("Не удалось отклонить заявку");
			} finally {
				processingUser.value = null;
			}
		};
		const toggleReports = (userId) => {
			openReports.value[userId] = !openReports.value[userId];
		};
		const dismissUserReports = async (userId) => {
			try {
				processingUser.value = userId;
				await axios$1.post(`/admin/users/${userId}/dismiss-reports`);
				users.value = users.value.filter((u) => u.id !== userId);
			} catch (err) {
				console.error("Ошибка игнорирования жалоб:", err);
				alert("Не удалось игнорировать жалобы");
			} finally {
				processingUser.value = null;
			}
		};
		const deleteUser = async (userId) => {
			if (!confirm("Вы уверены, что хотите заблокировать этого пользователя?")) return;
			try {
				processingUser.value = userId;
				await axios$1.delete(`/admin/users/${userId}`);
				users.value = users.value.filter((u) => u.id !== userId);
				alert("Пользователь заблокирован");
			} catch (err) {
				console.error("Ошибка блокировки пользователя:", err);
				alert("Не удалось заблокировать пользователя");
			} finally {
				processingUser.value = null;
			}
		};
		const handleSearch = () => {};
		onMounted(() => {
			adminLink = document.createElement("link");
			adminLink.rel = "stylesheet";
			adminLink.href = "/css/admin.css";
			document.head.appendChild(adminLink);
			adminScript = document.createElement("script");
			adminScript.src = "/js/admin.js";
			document.body.appendChild(adminScript);
			fetchUsers();
		});
		onUnmounted(() => {
			if (adminLink) {
				document.head.removeChild(adminLink);
				adminLink = null;
			}
			if (adminScript) {
				document.body.removeChild(adminScript);
				adminScript = null;
			}
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(AppLayout_default, _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="admin-container" data-v-db34bf3f${_scopeId}><h1 data-v-db34bf3f${_scopeId}>${ssrInterpolate(getPageTitle())}</h1><div class="admin-nav" data-v-db34bf3f${_scopeId}>`);
						_push(ssrRenderComponent(unref(Link), {
							href: "/admin",
							class: "admin-nav-item"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Главная `);
								else return [createTextVNode(" Главная ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(Link), {
							href: mode.value === "reports" ? "/admin/users?mode=reports" : "/admin/users",
							class: ["admin-nav-item", { active: mode.value !== "reports" }]
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Пользователи `);
								else return [createTextVNode(" Пользователи ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(Link), {
							href: "/admin/posts",
							class: "admin-nav-item"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Посты `);
								else return [createTextVNode(" Посты ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(Link), {
							href: "/admin/comments",
							class: "admin-nav-item"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Комментарии `);
								else return [createTextVNode(" Комментарии ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div><div class="search-container" data-v-db34bf3f${_scopeId}><input type="text" id="userSearch"${ssrRenderAttr("value", searchQuery.value)} placeholder="Поиск пользователя..." data-v-db34bf3f${_scopeId}></div>`);
						if (loading.value) _push(`<div class="loading" data-v-db34bf3f${_scopeId}> Загрузка... </div>`);
						else if (error.value) _push(`<div class="error" data-v-db34bf3f${_scopeId}>${ssrInterpolate(error.value)}</div>`);
						else {
							_push(`<div class="users-list" data-v-db34bf3f${_scopeId}><!--[-->`);
							ssrRenderList(filteredUsers.value, (user) => {
								_push(`<div class="user-item" data-v-db34bf3f${_scopeId}><img${ssrRenderAttr("src", getUserAvatar(user))}${ssrRenderAttr("alt", user.name)} class="user-avatar" data-v-db34bf3f${_scopeId}><div class="user-info" data-v-db34bf3f${_scopeId}><h3 data-v-db34bf3f${_scopeId}>${ssrInterpolate(user.name)}</h3><p data-v-db34bf3f${_scopeId}>${ssrInterpolate(user.email)}</p>`);
								if (user.phone) _push(`<p class="user-phone" data-v-db34bf3f${_scopeId}>${ssrInterpolate(user.phone)}</p>`);
								else _push(`<!---->`);
								if (mode.value === "verification") {
									_push(`<div class="verification-info" data-v-db34bf3f${_scopeId}><button class="attempts-toggle" data-v-db34bf3f${_scopeId}> Кол-во попыток получить верификацию: ${ssrInterpolate(user.verification_attempts || 0)} <span class="${ssrRenderClass([{ open: openRejections.value[user.id] }, "arrow"])}" data-v-db34bf3f${_scopeId}>▼</span></button>`);
									if (openRejections.value[user.id] && user.verification_rejections?.length) {
										_push(`<div class="rejections-dropdown" data-v-db34bf3f${_scopeId}><!--[-->`);
										ssrRenderList(user.verification_rejections, (rejection) => {
											_push(`<div class="rejection-item" data-v-db34bf3f${_scopeId}><div class="rejection-date" data-v-db34bf3f${_scopeId}>${ssrInterpolate(formatDate(rejection.rejected_at))}</div><div class="rejection-reason" data-v-db34bf3f${_scopeId}>${ssrInterpolate(rejection.reason)}</div></div>`);
										});
										_push(`<!--]--></div>`);
									} else if (openRejections.value[user.id]) _push(`<div class="no-rejections" data-v-db34bf3f${_scopeId}> История отказов пуста </div>`);
									else _push(`<!---->`);
									_push(`</div>`);
								} else _push(`<!---->`);
								if (mode.value === "reports" && user.reports?.length) {
									_push(`<div class="reports-info" data-v-db34bf3f${_scopeId}><p class="reports-count" data-v-db34bf3f${_scopeId}>Жалоб: ${ssrInterpolate(user.reports.length)}</p><button class="attempts-toggle" data-v-db34bf3f${_scopeId}> Подробнее <span class="${ssrRenderClass([{ open: openReports.value[user.id] }, "arrow"])}" data-v-db34bf3f${_scopeId}>▼</span></button>`);
									if (openReports.value[user.id]) {
										_push(`<div class="rejections-dropdown" data-v-db34bf3f${_scopeId}><!--[-->`);
										ssrRenderList(user.reports, (report) => {
											_push(`<div class="rejection-item" data-v-db34bf3f${_scopeId}><div class="rejection-date" data-v-db34bf3f${_scopeId}>${ssrInterpolate(formatDate(report.created_at))}</div><div class="rejection-reason" data-v-db34bf3f${_scopeId}>${ssrInterpolate(report.reason)}</div><div class="reporter-info" data-v-db34bf3f${_scopeId}>От: ${ssrInterpolate(report.reporter?.name || "Неизвестный")}</div></div>`);
										});
										_push(`<!--]--></div>`);
									} else _push(`<!---->`);
									_push(`</div>`);
								} else _push(`<!---->`);
								_push(`</div><div class="user-actions" data-v-db34bf3f${_scopeId}>`);
								_push(ssrRenderComponent(unref(Link), {
									href: `/profile/${user.id}`,
									class: "btn"
								}, {
									default: withCtx((_, _push, _parent, _scopeId) => {
										if (_push) _push(` Профиль `);
										else return [createTextVNode(" Профиль ")];
									}),
									_: 2
								}, _parent, _scopeId));
								if (mode.value === "verification") _push(`<!--[--><button class="btn btn-approve"${ssrIncludeBooleanAttr(processingUser.value === user.id) ? " disabled" : ""} data-v-db34bf3f${_scopeId}>${ssrInterpolate(processingUser.value === user.id ? "..." : "Одобрить")}</button><button class="btn btn-reject"${ssrIncludeBooleanAttr(processingUser.value === user.id) ? " disabled" : ""} data-v-db34bf3f${_scopeId}> Отказать </button><!--]-->`);
								else if (mode.value === "reports") _push(`<!--[--><button class="btn btn-dismiss"${ssrIncludeBooleanAttr(processingUser.value === user.id) ? " disabled" : ""} data-v-db34bf3f${_scopeId}>${ssrInterpolate(processingUser.value === user.id ? "..." : "Игнорировать")}</button><button class="btn btn-danger"${ssrIncludeBooleanAttr(processingUser.value === user.id) ? " disabled" : ""} data-v-db34bf3f${_scopeId}> Заблокировать </button><!--]-->`);
								else _push(`<button class="btn"${ssrIncludeBooleanAttr(sendingMessage.value === user.id) ? " disabled" : ""} data-v-db34bf3f${_scopeId}>${ssrInterpolate(sendingMessage.value === user.id ? "Отправка..." : "Сообщение")}</button>`);
								_push(`</div></div>`);
							});
							_push(`<!--]-->`);
							if (filteredUsers.value.length === 0) _push(`<div class="no-results" data-v-db34bf3f${_scopeId}>${ssrInterpolate(mode.value === "verification" ? "Заявок на подтверждение нет" : mode.value === "reports" ? "Нет жалоб на пользователей" : "Пользователи не найдены")}</div>`);
							else _push(`<!---->`);
							_push(`</div>`);
						}
						if (rejectingUserId.value) _push(`<div class="modal-overlay" data-v-db34bf3f${_scopeId}><div class="modal" data-v-db34bf3f${_scopeId}><h3 data-v-db34bf3f${_scopeId}>Укажите причину отказа</h3><textarea placeholder="Причина отказа..." rows="4" data-v-db34bf3f${_scopeId}>${ssrInterpolate(rejectionReason.value)}</textarea><div class="modal-actions" data-v-db34bf3f${_scopeId}><button class="btn btn-cancel" data-v-db34bf3f${_scopeId}>Отмена</button><button class="btn btn-reject"${ssrIncludeBooleanAttr(!rejectionReason.value.trim()) ? " disabled" : ""} data-v-db34bf3f${_scopeId}> Отправить </button></div></div></div>`);
						else _push(`<!---->`);
						_push(`</div>`);
					} else return [createVNode("div", { class: "admin-container" }, [
						createVNode("h1", null, toDisplayString(getPageTitle()), 1),
						createVNode("div", { class: "admin-nav" }, [
							createVNode(unref(Link), {
								href: "/admin",
								class: "admin-nav-item"
							}, {
								default: withCtx(() => [createTextVNode(" Главная ")]),
								_: 1
							}),
							createVNode(unref(Link), {
								href: mode.value === "reports" ? "/admin/users?mode=reports" : "/admin/users",
								class: ["admin-nav-item", { active: mode.value !== "reports" }]
							}, {
								default: withCtx(() => [createTextVNode(" Пользователи ")]),
								_: 1
							}, 8, ["href", "class"]),
							createVNode(unref(Link), {
								href: "/admin/posts",
								class: "admin-nav-item"
							}, {
								default: withCtx(() => [createTextVNode(" Посты ")]),
								_: 1
							}),
							createVNode(unref(Link), {
								href: "/admin/comments",
								class: "admin-nav-item"
							}, {
								default: withCtx(() => [createTextVNode(" Комментарии ")]),
								_: 1
							})
						]),
						createVNode("div", { class: "search-container" }, [withDirectives(createVNode("input", {
							type: "text",
							id: "userSearch",
							"onUpdate:modelValue": ($event) => searchQuery.value = $event,
							placeholder: "Поиск пользователя...",
							onInput: handleSearch
						}, null, 40, ["onUpdate:modelValue"]), [[vModelText, searchQuery.value]])]),
						loading.value ? (openBlock(), createBlock("div", {
							key: 0,
							class: "loading"
						}, " Загрузка... ")) : error.value ? (openBlock(), createBlock("div", {
							key: 1,
							class: "error"
						}, toDisplayString(error.value), 1)) : (openBlock(), createBlock("div", {
							key: 2,
							class: "users-list"
						}, [(openBlock(true), createBlock(Fragment, null, renderList(filteredUsers.value, (user) => {
							return openBlock(), createBlock("div", {
								key: user.id,
								class: "user-item"
							}, [
								createVNode("img", {
									src: getUserAvatar(user),
									alt: user.name,
									class: "user-avatar",
									onError: handleImageError
								}, null, 40, ["src", "alt"]),
								createVNode("div", { class: "user-info" }, [
									createVNode("h3", null, toDisplayString(user.name), 1),
									createVNode("p", null, toDisplayString(user.email), 1),
									user.phone ? (openBlock(), createBlock("p", {
										key: 0,
										class: "user-phone"
									}, toDisplayString(user.phone), 1)) : createCommentVNode("", true),
									mode.value === "verification" ? (openBlock(), createBlock("div", {
										key: 1,
										class: "verification-info"
									}, [createVNode("button", {
										class: "attempts-toggle",
										onClick: ($event) => toggleRejections(user.id)
									}, [createTextVNode(" Кол-во попыток получить верификацию: " + toDisplayString(user.verification_attempts || 0) + " ", 1), createVNode("span", { class: ["arrow", { open: openRejections.value[user.id] }] }, "▼", 2)], 8, ["onClick"]), openRejections.value[user.id] && user.verification_rejections?.length ? (openBlock(), createBlock("div", {
										key: 0,
										class: "rejections-dropdown"
									}, [(openBlock(true), createBlock(Fragment, null, renderList(user.verification_rejections, (rejection) => {
										return openBlock(), createBlock("div", {
											key: rejection.id,
											class: "rejection-item"
										}, [createVNode("div", { class: "rejection-date" }, toDisplayString(formatDate(rejection.rejected_at)), 1), createVNode("div", { class: "rejection-reason" }, toDisplayString(rejection.reason), 1)]);
									}), 128))])) : openRejections.value[user.id] ? (openBlock(), createBlock("div", {
										key: 1,
										class: "no-rejections"
									}, " История отказов пуста ")) : createCommentVNode("", true)])) : createCommentVNode("", true),
									mode.value === "reports" && user.reports?.length ? (openBlock(), createBlock("div", {
										key: 2,
										class: "reports-info"
									}, [
										createVNode("p", { class: "reports-count" }, "Жалоб: " + toDisplayString(user.reports.length), 1),
										createVNode("button", {
											class: "attempts-toggle",
											onClick: ($event) => toggleReports(user.id)
										}, [createTextVNode(" Подробнее "), createVNode("span", { class: ["arrow", { open: openReports.value[user.id] }] }, "▼", 2)], 8, ["onClick"]),
										openReports.value[user.id] ? (openBlock(), createBlock("div", {
											key: 0,
											class: "rejections-dropdown"
										}, [(openBlock(true), createBlock(Fragment, null, renderList(user.reports, (report) => {
											return openBlock(), createBlock("div", {
												key: report.id,
												class: "rejection-item"
											}, [
												createVNode("div", { class: "rejection-date" }, toDisplayString(formatDate(report.created_at)), 1),
												createVNode("div", { class: "rejection-reason" }, toDisplayString(report.reason), 1),
												createVNode("div", { class: "reporter-info" }, "От: " + toDisplayString(report.reporter?.name || "Неизвестный"), 1)
											]);
										}), 128))])) : createCommentVNode("", true)
									])) : createCommentVNode("", true)
								]),
								createVNode("div", { class: "user-actions" }, [createVNode(unref(Link), {
									href: `/profile/${user.id}`,
									class: "btn"
								}, {
									default: withCtx(() => [createTextVNode(" Профиль ")]),
									_: 1
								}, 8, ["href"]), mode.value === "verification" ? (openBlock(), createBlock(Fragment, { key: 0 }, [createVNode("button", {
									onClick: ($event) => approveUser(user.id),
									class: "btn btn-approve",
									disabled: processingUser.value === user.id
								}, toDisplayString(processingUser.value === user.id ? "..." : "Одобрить"), 9, ["onClick", "disabled"]), createVNode("button", {
									onClick: ($event) => showRejectModal(user.id),
									class: "btn btn-reject",
									disabled: processingUser.value === user.id
								}, " Отказать ", 8, ["onClick", "disabled"])], 64)) : mode.value === "reports" ? (openBlock(), createBlock(Fragment, { key: 1 }, [createVNode("button", {
									onClick: ($event) => dismissUserReports(user.id),
									class: "btn btn-dismiss",
									disabled: processingUser.value === user.id
								}, toDisplayString(processingUser.value === user.id ? "..." : "Игнорировать"), 9, ["onClick", "disabled"]), createVNode("button", {
									onClick: ($event) => deleteUser(user.id),
									class: "btn btn-danger",
									disabled: processingUser.value === user.id
								}, " Заблокировать ", 8, ["onClick", "disabled"])], 64)) : (openBlock(), createBlock("button", {
									key: 2,
									onClick: ($event) => startConversation(user.id),
									class: "btn",
									disabled: sendingMessage.value === user.id
								}, toDisplayString(sendingMessage.value === user.id ? "Отправка..." : "Сообщение"), 9, ["onClick", "disabled"]))])
							]);
						}), 128)), filteredUsers.value.length === 0 ? (openBlock(), createBlock("div", {
							key: 0,
							class: "no-results"
						}, toDisplayString(mode.value === "verification" ? "Заявок на подтверждение нет" : mode.value === "reports" ? "Нет жалоб на пользователей" : "Пользователи не найдены"), 1)) : createCommentVNode("", true)])),
						rejectingUserId.value ? (openBlock(), createBlock("div", {
							key: 3,
							class: "modal-overlay",
							onClick: withModifiers(closeRejectModal, ["self"])
						}, [createVNode("div", { class: "modal" }, [
							createVNode("h3", null, "Укажите причину отказа"),
							withDirectives(createVNode("textarea", {
								"onUpdate:modelValue": ($event) => rejectionReason.value = $event,
								placeholder: "Причина отказа...",
								rows: "4"
							}, null, 8, ["onUpdate:modelValue"]), [[vModelText, rejectionReason.value]]),
							createVNode("div", { class: "modal-actions" }, [createVNode("button", {
								onClick: closeRejectModal,
								class: "btn btn-cancel"
							}, "Отмена"), createVNode("button", {
								onClick: confirmReject,
								class: "btn btn-reject",
								disabled: !rejectionReason.value.trim()
							}, " Отправить ", 8, ["disabled"])])
						])])) : createCommentVNode("", true)
					])];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup$18 = _sfc_main$18.setup;
_sfc_main$18.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Admin/Users.vue");
	return _sfc_setup$18 ? _sfc_setup$18(props, ctx) : void 0;
};
var Users_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$18, [["__scopeId", "data-v-db34bf3f"]]);
//#endregion
//#region resources/js/composables/useSkills.js
function getSkillClass(skillName) {
	const name = skillName.toLowerCase();
	if (name.includes("php")) return "skill-php";
	if (name.includes("laravel")) return "skill-laravel";
	if (name.includes("vue")) return "skill-vue";
	if (name.includes("js") || name.includes("javascript")) return "skill-js";
	if (name.includes("react")) return "skill-react";
	if (name.includes("node")) return "skill-node";
	if (name.includes("python")) return "skill-python";
	if (name.includes("django")) return "skill-django";
	if (name.includes("design") || name.includes("ui")) return "skill-design";
	if (name.includes("figma")) return "skill-figma";
	if (name.includes("photoshop") || name.includes("illustrator")) return "skill-photoshop";
	if (name.includes("copy") || name.includes("content")) return "skill-copywriting";
	if (name.includes("marketing") || name.includes("seo") || name.includes("smm")) return "skill-marketing";
	if (name.includes("video")) return "skill-video";
	if (name.includes("3d")) return "skill-3d";
	if (name.includes("animation") || name.includes("motion")) return "skill-animation";
	if (name.includes("translation")) return "skill-translation";
	if (name.includes("data") || name.includes("excel")) return "skill-data";
	return "skill-default";
}
//#endregion
//#region resources/js/Components/SkillsSelector.vue
var _sfc_main$17 = {
	__name: "SkillsSelector",
	__ssrInlineRender: true,
	props: {
		skills: {
			type: Array,
			default: () => []
		},
		modelValue: {
			type: Array,
			default: () => []
		}
	},
	emits: ["update:modelValue"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		useDarkMode();
		const dropdownOpen = ref(false);
		const selectedSkills = ref([...props.modelValue]);
		watch(() => props.modelValue, (newVal) => {
			selectedSkills.value = [...newVal];
		}, { deep: true });
		const isSkillSelected = (skillId) => {
			return selectedSkills.value.some((s) => s.id === skillId);
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(_attrs)} data-v-0c399c5b><div class="form-row" data-v-0c399c5b><div class="form-group" data-v-0c399c5b><div class="multiselect-container" data-v-0c399c5b><div class="multiselect-trigger" data-v-0c399c5b>`);
			if (selectedSkills.value.length === 0) _push(`<span data-v-0c399c5b>Выберите навыки</span>`);
			else _push(`<span data-v-0c399c5b>Выбрано: ${ssrInterpolate(selectedSkills.value.length)}</span>`);
			_push(`<span class="arrow" data-v-0c399c5b>▼</span></div>`);
			if (dropdownOpen.value) {
				_push(`<div class="multiselect-dropdown" data-v-0c399c5b><!--[-->`);
				ssrRenderList(__props.skills, (skill) => {
					_push(`<div class="${ssrRenderClass([{ selected: isSkillSelected(skill.id) }, "multiselect-option"])}" data-v-0c399c5b><span class="${ssrRenderClass([unref(getSkillClass)(skill.name), "skill-name"])}" data-v-0c399c5b>${ssrInterpolate(skill.name)}</span>`);
					if (isSkillSelected(skill.id)) _push(`<span class="check" data-v-0c399c5b>✓</span>`);
					else _push(`<!---->`);
					_push(`</div>`);
				});
				_push(`<!--]--></div>`);
			} else _push(`<!---->`);
			_push(`</div></div></div>`);
			if (selectedSkills.value.length > 0) {
				_push(`<div class="selected-skills" data-v-0c399c5b><!--[-->`);
				ssrRenderList(selectedSkills.value, (skill) => {
					_push(`<div class="${ssrRenderClass([unref(getSkillClass)(skill.name), "skill-tag"])}" data-v-0c399c5b><span class="skill-name" data-v-0c399c5b>${ssrInterpolate(skill.name)}</span><div class="skill-level" data-v-0c399c5b><select${ssrRenderAttr("value", skill.level)} data-v-0c399c5b><option value="1" data-v-0c399c5b>1</option><option value="2" data-v-0c399c5b>2</option><option value="3" data-v-0c399c5b>3</option><option value="4" data-v-0c399c5b>4</option><option value="5" data-v-0c399c5b>5</option></select></div><button type="button" class="remove-skill" data-v-0c399c5b>×</button></div>`);
				});
				_push(`<!--]--></div>`);
			} else _push(`<!---->`);
			_push(`</div>`);
		};
	}
};
var _sfc_setup$17 = _sfc_main$17.setup;
_sfc_main$17.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/SkillsSelector.vue");
	return _sfc_setup$17 ? _sfc_setup$17(props, ctx) : void 0;
};
var SkillsSelector_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$17, [["__scopeId", "data-v-0c399c5b"]]);
//#endregion
//#region resources/js/Pages/Auth/Auth.vue
var Auth_exports = /* @__PURE__ */ __exportAll({ default: () => Auth_default });
var _sfc_main$16 = /* @__PURE__ */ Object.assign({ layout: AppLayout_default }, {
	__name: "Auth",
	__ssrInlineRender: true,
	props: {
		errors: Object,
		skills: {
			type: Array,
			default: () => []
		}
	},
	setup(__props) {
		const props = __props;
		useDarkMode();
		const mode = ref("login");
		const currentStep = ref(1);
		const loginError = ref("");
		const avatarPreview = ref("");
		const loginForm = useForm({
			email: "",
			password: ""
		});
		const registerForm = useForm({
			name: "",
			email: "",
			password: "",
			password_confirmation: "",
			avatar: null,
			bio: "",
			skills: [],
			phone: "",
			resume: null,
			passport: null,
			certificates: null,
			email_confirmed: false,
			request_verification: false
		});
		const registerData = reactive({
			name: "",
			email: "",
			password: "",
			password_confirmation: "",
			avatar: null,
			bio: "",
			skills: [],
			phone: "",
			resume: null,
			passport: null,
			certificates: null,
			email_confirmed: false,
			request_verification: false
		});
		const validationErrors = reactive({ step1: "" });
		const registerErrors = ref([]);
		watch(() => props.errors, (newErrors) => {
			registerErrors.value = newErrors ? Object.values(newErrors).flat() : [];
		}, {
			immediate: true,
			deep: true
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<!--[-->`);
			_push(ssrRenderComponent(unref(Head), { title: mode.value === "login" ? "Вход" : "Регистрация" }, null, _parent));
			_push(`<div class="${ssrRenderClass([{ "register-mode": mode.value === "register" }, "Authblock"])}" data-v-08cb4a53><div class="form-wrapper" data-v-08cb4a53>`);
			if (mode.value === "login") {
				_push(`<form data-v-08cb4a53><h1 data-v-08cb4a53>Вход</h1>`);
				if (_ctx.$page.props.errors.error) _push(`<div class="error-message global-error" data-v-08cb4a53>${ssrInterpolate(_ctx.$page.props.errors.error)}</div>`);
				else _push(`<!---->`);
				_push(`<div class="login-content" data-v-08cb4a53><div class="input-group" data-v-08cb4a53><label data-v-08cb4a53>Email</label><input type="email"${ssrRenderAttr("value", unref(loginForm).email)} placeholder="Введите email" required data-v-08cb4a53></div><div class="input-group" data-v-08cb4a53><label data-v-08cb4a53>Пароль</label><input type="password"${ssrRenderAttr("value", unref(loginForm).password)} placeholder="Введите пароль" required data-v-08cb4a53>`);
				if (loginError.value) _push(`<div class="field-error" data-v-08cb4a53>${ssrInterpolate(loginError.value)}</div>`);
				else _push(`<!---->`);
				_push(`</div></div><button type="submit"${ssrIncludeBooleanAttr(unref(loginForm).processing) ? " disabled" : ""} data-v-08cb4a53>${ssrInterpolate(unref(loginForm).processing ? "Вход..." : "Войти")}</button><button type="button" class="switch-mode" data-v-08cb4a53> Нет аккаунта? Зарегистрироваться </button><div class="oauth-divider" data-v-08cb4a53><span data-v-08cb4a53>Или</span></div><div class="oauth-buttons" data-v-08cb4a53><a href="/auth/google/redirect" class="oauth-btn oauth-google" data-inertia="false" data-v-08cb4a53><img src="/images/google.svg" alt="" data-v-08cb4a53> Войти через Google </a><a href="/auth/github/redirect" class="oauth-btn oauth-github" data-inertia="false" data-v-08cb4a53><img src="/images/github.svg" alt="" data-v-08cb4a53> Войти через GitHub </a></div></form>`);
			} else {
				_push(`<form class="register-form" data-v-08cb4a53><h1 data-v-08cb4a53>Регистрация</h1><div class="step-indicator" data-v-08cb4a53><!--[-->`);
				ssrRenderList(3, (step) => {
					_push(`<div class="${ssrRenderClass([{
						active: currentStep.value === step,
						completed: currentStep.value > step
					}, "step-dot"])}" data-v-08cb4a53></div>`);
				});
				_push(`<!--]--></div><div class="step-content" data-v-08cb4a53>`);
				if (currentStep.value === 1) {
					_push(`<div class="step step-1" data-v-08cb4a53><div class="input-group" data-v-08cb4a53><label data-v-08cb4a53>Имя</label><input type="text"${ssrRenderAttr("value", registerData.name)} placeholder="Введите имя" required data-v-08cb4a53></div><div class="input-group" data-v-08cb4a53><label data-v-08cb4a53>Email</label><input type="email"${ssrRenderAttr("value", registerData.email)} placeholder="Введите email" required data-v-08cb4a53></div><div class="input-group" data-v-08cb4a53><label data-v-08cb4a53>Пароль</label><input type="password"${ssrRenderAttr("value", registerData.password)} placeholder="Минимум 8 символов" required data-v-08cb4a53></div><div class="input-group" data-v-08cb4a53><label data-v-08cb4a53>Подтверждение пароля</label><input type="password"${ssrRenderAttr("value", registerData.password_confirmation)} placeholder="Повторите пароль" required data-v-08cb4a53></div>`);
					if (validationErrors.step1) _push(`<div class="error-message" data-v-08cb4a53>${ssrInterpolate(validationErrors.step1)}</div>`);
					else _push(`<!---->`);
					if (registerErrors.value.length > 0) {
						_push(`<div class="error-message" data-v-08cb4a53><!--[-->`);
						ssrRenderList(registerErrors.value, (err) => {
							_push(`<div data-v-08cb4a53>${ssrInterpolate(err)}</div>`);
						});
						_push(`<!--]--></div>`);
					} else _push(`<!---->`);
					_push(`</div>`);
				} else if (currentStep.value === 2) {
					_push(`<div class="step step-2" data-v-08cb4a53><p class="optional-notice" data-v-08cb4a53>Опционально — вы сможете поменять данные в настройках личного кабинета</p><div class="avatar-upload" data-v-08cb4a53><label data-v-08cb4a53>Аватар</label><div class="avatar-preview" data-v-08cb4a53>`);
					if (avatarPreview.value) _push(`<img${ssrRenderAttr("src", avatarPreview.value)} alt="Avatar preview" data-v-08cb4a53>`);
					else _push(`<span class="avatar-placeholder" data-v-08cb4a53>Нажмите для загрузки</span>`);
					_push(`</div><input type="file" accept="image/*" hidden data-v-08cb4a53>`);
					if (avatarPreview.value) _push(`<button type="button" class="remove-avatar" data-v-08cb4a53>Удалить</button>`);
					else _push(`<!---->`);
					_push(`</div><div class="form-group" data-v-08cb4a53><label data-v-08cb4a53>О себе</label><textarea placeholder="Расскажите о себе..." rows="4" data-v-08cb4a53>${ssrInterpolate(registerData.bio)}</textarea></div><div class="form-group" data-v-08cb4a53><div class="label-with-tooltip" data-v-08cb4a53><label data-v-08cb4a53>Навыки</label><div class="tooltip-trigger" data-v-08cb4a53><span class="help-icon" data-v-08cb4a53>?</span><div class="tooltip-content" data-v-08cb4a53> Выберите навыки, которыми вы владеете. Это поможет работодателям найти вас по соответствующим вакансиям. </div></div></div>`);
					_push(ssrRenderComponent(SkillsSelector_default, {
						modelValue: registerData.skills,
						"onUpdate:modelValue": ($event) => registerData.skills = $event,
						skills: __props.skills
					}, null, _parent));
					if (registerData.skills.length > 0) {
						_push(`<div class="selected-skills" data-v-08cb4a53><!--[-->`);
						ssrRenderList(registerData.skills, (skill) => {
							_push(`<div class="${ssrRenderClass([unref(getSkillClass)(skill.name), "skill-tag"])}" data-v-08cb4a53><span class="skill-name" data-v-08cb4a53>${ssrInterpolate(skill.name)}</span><button type="button" class="remove-skill" data-v-08cb4a53>×</button></div>`);
						});
						_push(`<!--]--></div>`);
					} else _push(`<!---->`);
					_push(`</div></div>`);
				} else if (currentStep.value === 3) {
					_push(`<div class="step step-3" data-v-08cb4a53><p class="optional-notice" data-v-08cb4a53>Опционально — повысьте шансы на трудоустройство</p><div class="form-group" data-v-08cb4a53><label data-v-08cb4a53>Телефон</label><div class="phone-input-wrapper" data-v-08cb4a53><input type="tel"${ssrRenderAttr("value", registerData.phone)} placeholder="+7 (___) ___-__-__" data-v-08cb4a53><span class="phone-hint" data-v-08cb4a53>Пригодится для двухфакторной аутентификации</span></div></div><div class="form-group" data-v-08cb4a53><label data-v-08cb4a53>Резюме</label><div class="file-upload" data-v-08cb4a53>`);
					if (registerData.resume) _push(`<span data-v-08cb4a53>${ssrInterpolate(registerData.resume.name)}</span>`);
					else _push(`<span data-v-08cb4a53>Нажмите для загрузки PDF, DOC, DOCX</span>`);
					_push(`</div><input type="file" accept=".pdf,.doc,.docx" hidden data-v-08cb4a53></div><div class="form-group" data-v-08cb4a53><label data-v-08cb4a53>Паспорт</label><div class="file-upload" data-v-08cb4a53>`);
					if (registerData.passport) _push(`<span data-v-08cb4a53>${ssrInterpolate(registerData.passport.name)}</span>`);
					else _push(`<span data-v-08cb4a53>Загрузите скан паспорта или сфоткайте разворот</span>`);
					_push(`</div><input type="file" accept="image/*,.pdf" hidden data-v-08cb4a53></div><div class="form-group" data-v-08cb4a53><label data-v-08cb4a53>Диплом/Сертификаты</label><div class="file-upload" data-v-08cb4a53>`);
					if (registerData.certificates) _push(`<span data-v-08cb4a53>${ssrInterpolate(registerData.certificates.name)}</span>`);
					else _push(`<span data-v-08cb4a53>Загрузите документы об образовании</span>`);
					_push(`</div><input type="file" accept="image/*,.pdf" hidden data-v-08cb4a53><span class="phone-hint" data-v-08cb4a53>(Вы сможете найти их в настройках в вкладке Мои файлы) </span></div><div class="checkbox-group" data-v-08cb4a53><label class="checkbox-label" data-v-08cb4a53><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(registerData.email_confirmed) ? ssrLooseContain(registerData.email_confirmed, null) : registerData.email_confirmed) ? " checked" : ""} data-v-08cb4a53><span data-v-08cb4a53>Подтвердить email</span></label></div><div class="checkbox-group" data-v-08cb4a53><label class="checkbox-label verification-label" data-v-08cb4a53><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(registerData.request_verification) ? ssrLooseContain(registerData.request_verification, null) : registerData.request_verification) ? " checked" : ""} data-v-08cb4a53><span data-v-08cb4a53>Запросить верификацию аккаунта</span><div class="tooltip-trigger" data-v-08cb4a53><span class="help-icon" data-v-08cb4a53>?</span><div class="tooltip-content" data-v-08cb4a53> Верификация добавит галочку <img src="/images/verified.svg" alt="" data-v-08cb4a53> рядом с вашим именем, что повысит доверие работодателей. </div></div></label></div></div>`);
				} else _push(`<!---->`);
				_push(`</div><div class="form-actions" data-v-08cb4a53>`);
				if (currentStep.value > 1) _push(`<button type="button" class="btn-back" data-v-08cb4a53> Назад </button>`);
				else _push(`<!---->`);
				if (currentStep.value < 3) _push(`<button type="button" class="btn-next" data-v-08cb4a53> Далее </button>`);
				else _push(`<button type="submit"${ssrIncludeBooleanAttr(unref(registerForm).processing) ? " disabled" : ""} class="btn-submit" data-v-08cb4a53>${ssrInterpolate(unref(registerForm).processing ? "Регистрация..." : "Зарегистрироваться")}</button>`);
				_push(`</div><button type="button" class="switch-mode" data-v-08cb4a53> Уже есть аккаунт? Войти </button></form>`);
			}
			_push(`</div></div><!--]-->`);
		};
	}
});
var _sfc_setup$16 = _sfc_main$16.setup;
_sfc_main$16.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Auth/Auth.vue");
	return _sfc_setup$16 ? _sfc_setup$16(props, ctx) : void 0;
};
var Auth_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$16, [["__scopeId", "data-v-08cb4a53"]]);
//#endregion
//#region resources/js/Pages/Balance/Index.vue
var Index_exports$2 = /* @__PURE__ */ __exportAll({ default: () => Index_default$2 });
var _sfc_main$15 = {
	__name: "Index",
	__ssrInlineRender: true,
	props: {
		balance: {
			type: [Number, String],
			default: 0
		},
		pendingTransactions: {
			type: Array,
			default: () => []
		},
		transactions: {
			type: Object,
			default: () => ({
				data: [],
				current_page: 1,
				last_page: 1
			})
		}
	},
	setup(__props) {
		const props = __props;
		useDarkMode();
		const page = usePage();
		const authUser = computed(() => page.props.auth?.user || page.props.authUser || null);
		const quickAmounts = [
			100,
			300,
			500,
			1e3,
			3e3,
			5e3
		];
		const withdrawalAmounts = [
			100,
			300,
			500,
			1e3,
			3e3,
			5e3
		];
		const isWithdrawal = ref(false);
		const filter = ref("all");
		const form = useForm({ amount: "" });
		const submitBalance = () => {
			const url = isWithdrawal.value ? "/balance/withdraw" : "/balance/add";
			form.post(url, {
				preserveScroll: true,
				onSuccess: () => {
					form.reset();
				}
			});
		};
		const getDaysRemaining = (transaction) => {
			if (!transaction.completed_at) return 7;
			const diffTime = new Date(transaction.completed_at) - /* @__PURE__ */ new Date();
			const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
			return Math.max(0, 7 - diffDays);
		};
		const filteredTransactions = computed(() => {
			if (!props.transactions || !props.transactions.data) return [];
			return props.transactions.data.filter((transaction) => {
				if (filter.value === "all") return true;
				if (filter.value === "incoming") return transaction.to_user_id === authUser.value?.id;
				if (filter.value === "outgoing") return transaction.from_user_id === authUser.value?.id;
				return true;
			});
		});
		const isIncoming = (transaction) => {
			return transaction.to_user_id === authUser.value?.id;
		};
		const isOutgoing = (transaction) => {
			return transaction.from_user_id === authUser.value?.id;
		};
		const getTransactionIcon = (transaction) => {
			if (transaction.status === "pending") return "⏳";
			if (transaction.status === "cancelled") return "❌";
			if (transaction.type === "deposit") return "💰";
			if (transaction.type === "withdrawal") return "💸";
			if (transaction.type === "payment") return "💳";
			return "💱";
		};
		const getTransactionType = (transaction) => {
			if (transaction.status === "pending") return "Ожидание зачисления";
			if (transaction.status === "cancelled") return "Отменено";
			if (transaction.type === "deposit") return "Пополнение баланса";
			if (transaction.type === "withdrawal") return "Снятие средств";
			if (transaction.type === "payment") return transaction.description || "Оплата";
			return transaction.description || "Перевод";
		};
		const getTransactionParty = (transaction) => {
			if (transaction.type === "deposit" || transaction.type === "withdrawal") return null;
			if (isIncoming(transaction) && transaction.from_user) return `От: ${transaction.from_user.name}`;
			if (isOutgoing(transaction) && transaction.to_user) return `Кому: ${transaction.to_user.name}`;
			return null;
		};
		const formatDate = (dateString) => {
			return new Date(dateString).toLocaleDateString("ru-RU", {
				day: "numeric",
				month: "short",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit"
			});
		};
		const loadPage = (pageNum) => {
			window.location.href = `/balance?page=${pageNum}`;
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(AppLayout_default, _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(unref(Head), { title: "Баланс" }, null, _parent, _scopeId));
						_push(`<div class="balance-page" data-v-92cdf31e${_scopeId}><div class="back-link" data-v-92cdf31e${_scopeId}>`);
						_push(ssrRenderComponent(unref(Link), {
							href: "#",
							onclick: "history.back(); return false;"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` ← Назад `);
								else return [createTextVNode(" ← Назад ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div><div class="balance-container" data-v-92cdf31e${_scopeId}>`);
						if (__props.pendingTransactions && __props.pendingTransactions.length > 0) {
							_push(`<div class="pending-section" data-v-92cdf31e${_scopeId}><h2 data-v-92cdf31e${_scopeId}>Ожидающие зачисления</h2><div class="transactions-list" data-v-92cdf31e${_scopeId}><!--[-->`);
							ssrRenderList(__props.pendingTransactions, (transaction) => {
								_push(`<div class="transaction-item pending" data-v-92cdf31e${_scopeId}><div class="transaction-icon" data-v-92cdf31e${_scopeId}>⏳</div><div class="transaction-details" data-v-92cdf31e${_scopeId}><div class="transaction-type" data-v-92cdf31e${_scopeId}>${ssrInterpolate(transaction.type === "payment" ? "Оплата за работу" : transaction.description)}</div>`);
								if (transaction.from_user) _push(`<div class="transaction-from" data-v-92cdf31e${_scopeId}> От: ${ssrInterpolate(transaction.from_user.name)}</div>`);
								else _push(`<!---->`);
								if (transaction.application?.vacancy) _push(`<div class="transaction-vacancy" data-v-92cdf31e${_scopeId}> Вакансия: ${ssrInterpolate(transaction.application.vacancy.position)}</div>`);
								else _push(`<!---->`);
								_push(`<div class="transaction-status" data-v-92cdf31e${_scopeId}> Ожидание: ${ssrInterpolate(getDaysRemaining(transaction))} дн. </div></div><div class="transaction-amount" data-v-92cdf31e${_scopeId}>+${ssrInterpolate(Number(transaction.amount).toFixed(2))} ₽</div></div>`);
							});
							_push(`<!--]--></div></div>`);
						} else _push(`<!---->`);
						_push(`<div class="history-section" data-v-92cdf31e${_scopeId}><h1 data-v-92cdf31e${_scopeId}>История транзакций</h1><div class="filter-tabs" data-v-92cdf31e${_scopeId}><button class="${ssrRenderClass({ active: filter.value === "all" })}" data-v-92cdf31e${_scopeId}> Все </button><button class="${ssrRenderClass({ active: filter.value === "incoming" })}" data-v-92cdf31e${_scopeId}> Входящие </button><button class="${ssrRenderClass({ active: filter.value === "outgoing" })}" data-v-92cdf31e${_scopeId}> Исходящие </button></div>`);
						if (filteredTransactions.value.length > 0) {
							_push(`<div class="transactions-list" data-v-92cdf31e${_scopeId}><!--[-->`);
							ssrRenderList(filteredTransactions.value, (transaction) => {
								_push(`<div class="${ssrRenderClass([{
									pending: transaction.status === "pending",
									cancelled: transaction.status === "cancelled"
								}, "transaction-item"])}" data-v-92cdf31e${_scopeId}><div class="transaction-icon" data-v-92cdf31e${_scopeId}>${ssrInterpolate(getTransactionIcon(transaction))}</div><div class="transaction-details" data-v-92cdf31e${_scopeId}><div class="transaction-type" data-v-92cdf31e${_scopeId}>${ssrInterpolate(getTransactionType(transaction))}</div>`);
								if (getTransactionParty(transaction)) _push(`<div class="transaction-party" data-v-92cdf31e${_scopeId}>${ssrInterpolate(getTransactionParty(transaction))}</div>`);
								else _push(`<!---->`);
								_push(`<div class="transaction-date" data-v-92cdf31e${_scopeId}>${ssrInterpolate(formatDate(transaction.created_at))}</div></div><div class="${ssrRenderClass([{
									incoming: isIncoming(transaction),
									outgoing: isOutgoing(transaction)
								}, "transaction-amount"])}" data-v-92cdf31e${_scopeId}>${ssrInterpolate(isIncoming(transaction) ? "+" : "-")}${ssrInterpolate(Number(transaction.amount).toFixed(2))} ₽ </div></div>`);
							});
							_push(`<!--]--></div>`);
						} else _push(`<div class="no-transactions" data-v-92cdf31e${_scopeId}> Транзакций пока нет </div>`);
						if (__props.transactions && __props.transactions.last_page > 1) {
							_push(`<div class="pagination" data-v-92cdf31e${_scopeId}>`);
							if (__props.transactions.current_page > 1) _push(`<button class="pagination-btn" data-v-92cdf31e${_scopeId}> ← Назад </button>`);
							else _push(`<!---->`);
							_push(`<span class="pagination-info" data-v-92cdf31e${_scopeId}> Страница ${ssrInterpolate(__props.transactions.current_page)} из ${ssrInterpolate(__props.transactions.last_page)}</span>`);
							if (__props.transactions.current_page < __props.transactions.last_page) _push(`<button class="pagination-btn" data-v-92cdf31e${_scopeId}> Вперёд → </button>`);
							else _push(`<!---->`);
							_push(`</div>`);
						} else _push(`<!---->`);
						_push(`</div><div class="balance-card" data-v-92cdf31e${_scopeId}><h1 data-v-92cdf31e${_scopeId}>${ssrInterpolate(isWithdrawal.value ? "Снятие средств" : "Пополнение баланса")}</h1><div class="current-balance" data-v-92cdf31e${_scopeId}><span class="label" data-v-92cdf31e${_scopeId}>Текущий баланс:</span><span class="amount" data-v-92cdf31e${_scopeId}>${ssrInterpolate(Number(__props.balance))} ₽</span></div><div class="type-toggle" data-v-92cdf31e${_scopeId}><button class="${ssrRenderClass({ active: !isWithdrawal.value })}" data-v-92cdf31e${_scopeId}> Пополнение </button><button class="${ssrRenderClass({ active: isWithdrawal.value })}"${ssrIncludeBooleanAttr(Number(__props.balance) <= 0) ? " disabled" : ""} data-v-92cdf31e${_scopeId}> Снятие </button></div><form class="balance-form" data-v-92cdf31e${_scopeId}><div class="form-group" data-v-92cdf31e${_scopeId}><label for="amount" data-v-92cdf31e${_scopeId}>${ssrInterpolate(isWithdrawal.value ? "Сумма снятия:" : "Сумма пополнения:")}</label><input type="number" name="amount" id="amount"${ssrRenderAttr("value", unref(form).amount)}${ssrRenderAttr("min", 1)}${ssrRenderAttr("max", isWithdrawal.value ? Number(__props.balance) : 1e5)} required placeholder="Введите сумму" data-v-92cdf31e${_scopeId}></div>`);
						if (!isWithdrawal.value) {
							_push(`<div class="quick-amounts" data-v-92cdf31e${_scopeId}><!--[-->`);
							ssrRenderList(quickAmounts, (amount) => {
								_push(`<button type="button" class="${ssrRenderClass({ active: unref(form).amount === amount })}" data-v-92cdf31e${_scopeId}>${ssrInterpolate(amount)} ₽ </button>`);
							});
							_push(`<!--]--></div>`);
						} else {
							_push(`<div class="quick-amounts" data-v-92cdf31e${_scopeId}><!--[-->`);
							ssrRenderList(withdrawalAmounts, (amount) => {
								_push(`<button type="button" class="${ssrRenderClass({ active: unref(form).amount === amount })}" data-v-92cdf31e${_scopeId}>${ssrInterpolate(amount)} ₽ </button>`);
							});
							_push(`<!--]--></div>`);
						}
						_push(`<button type="submit" class="btn-submit"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""} data-v-92cdf31e${_scopeId}>${ssrInterpolate(unref(form).processing ? isWithdrawal.value ? "Снятие..." : "Пополнение..." : isWithdrawal.value ? "Снять средства" : "Пополнить баланс")}</button></form></div></div></div>`);
					} else return [createVNode(unref(Head), { title: "Баланс" }), createVNode("div", { class: "balance-page" }, [createVNode("div", { class: "back-link" }, [createVNode(unref(Link), {
						href: "#",
						onclick: "history.back(); return false;"
					}, {
						default: withCtx(() => [createTextVNode(" ← Назад ")]),
						_: 1
					})]), createVNode("div", { class: "balance-container" }, [
						__props.pendingTransactions && __props.pendingTransactions.length > 0 ? (openBlock(), createBlock("div", {
							key: 0,
							class: "pending-section"
						}, [createVNode("h2", null, "Ожидающие зачисления"), createVNode("div", { class: "transactions-list" }, [(openBlock(true), createBlock(Fragment, null, renderList(__props.pendingTransactions, (transaction) => {
							return openBlock(), createBlock("div", {
								key: transaction.id,
								class: "transaction-item pending"
							}, [
								createVNode("div", { class: "transaction-icon" }, "⏳"),
								createVNode("div", { class: "transaction-details" }, [
									createVNode("div", { class: "transaction-type" }, toDisplayString(transaction.type === "payment" ? "Оплата за работу" : transaction.description), 1),
									transaction.from_user ? (openBlock(), createBlock("div", {
										key: 0,
										class: "transaction-from"
									}, " От: " + toDisplayString(transaction.from_user.name), 1)) : createCommentVNode("", true),
									transaction.application?.vacancy ? (openBlock(), createBlock("div", {
										key: 1,
										class: "transaction-vacancy"
									}, " Вакансия: " + toDisplayString(transaction.application.vacancy.position), 1)) : createCommentVNode("", true),
									createVNode("div", { class: "transaction-status" }, " Ожидание: " + toDisplayString(getDaysRemaining(transaction)) + " дн. ", 1)
								]),
								createVNode("div", { class: "transaction-amount" }, "+" + toDisplayString(Number(transaction.amount).toFixed(2)) + " ₽", 1)
							]);
						}), 128))])])) : createCommentVNode("", true),
						createVNode("div", { class: "history-section" }, [
							createVNode("h1", null, "История транзакций"),
							createVNode("div", { class: "filter-tabs" }, [
								createVNode("button", {
									class: { active: filter.value === "all" },
									onClick: ($event) => filter.value = "all"
								}, " Все ", 10, ["onClick"]),
								createVNode("button", {
									class: { active: filter.value === "incoming" },
									onClick: ($event) => filter.value = "incoming"
								}, " Входящие ", 10, ["onClick"]),
								createVNode("button", {
									class: { active: filter.value === "outgoing" },
									onClick: ($event) => filter.value = "outgoing"
								}, " Исходящие ", 10, ["onClick"])
							]),
							filteredTransactions.value.length > 0 ? (openBlock(), createBlock("div", {
								key: 0,
								class: "transactions-list"
							}, [(openBlock(true), createBlock(Fragment, null, renderList(filteredTransactions.value, (transaction) => {
								return openBlock(), createBlock("div", {
									key: transaction.id,
									class: ["transaction-item", {
										pending: transaction.status === "pending",
										cancelled: transaction.status === "cancelled"
									}]
								}, [
									createVNode("div", { class: "transaction-icon" }, toDisplayString(getTransactionIcon(transaction)), 1),
									createVNode("div", { class: "transaction-details" }, [
										createVNode("div", { class: "transaction-type" }, toDisplayString(getTransactionType(transaction)), 1),
										getTransactionParty(transaction) ? (openBlock(), createBlock("div", {
											key: 0,
											class: "transaction-party"
										}, toDisplayString(getTransactionParty(transaction)), 1)) : createCommentVNode("", true),
										createVNode("div", { class: "transaction-date" }, toDisplayString(formatDate(transaction.created_at)), 1)
									]),
									createVNode("div", { class: ["transaction-amount", {
										incoming: isIncoming(transaction),
										outgoing: isOutgoing(transaction)
									}] }, toDisplayString(isIncoming(transaction) ? "+" : "-") + toDisplayString(Number(transaction.amount).toFixed(2)) + " ₽ ", 3)
								], 2);
							}), 128))])) : (openBlock(), createBlock("div", {
								key: 1,
								class: "no-transactions"
							}, " Транзакций пока нет ")),
							__props.transactions && __props.transactions.last_page > 1 ? (openBlock(), createBlock("div", {
								key: 2,
								class: "pagination"
							}, [
								__props.transactions.current_page > 1 ? (openBlock(), createBlock("button", {
									key: 0,
									onClick: ($event) => loadPage(__props.transactions.current_page - 1),
									class: "pagination-btn"
								}, " ← Назад ", 8, ["onClick"])) : createCommentVNode("", true),
								createVNode("span", { class: "pagination-info" }, " Страница " + toDisplayString(__props.transactions.current_page) + " из " + toDisplayString(__props.transactions.last_page), 1),
								__props.transactions.current_page < __props.transactions.last_page ? (openBlock(), createBlock("button", {
									key: 1,
									onClick: ($event) => loadPage(__props.transactions.current_page + 1),
									class: "pagination-btn"
								}, " Вперёд → ", 8, ["onClick"])) : createCommentVNode("", true)
							])) : createCommentVNode("", true)
						]),
						createVNode("div", { class: "balance-card" }, [
							createVNode("h1", null, toDisplayString(isWithdrawal.value ? "Снятие средств" : "Пополнение баланса"), 1),
							createVNode("div", { class: "current-balance" }, [createVNode("span", { class: "label" }, "Текущий баланс:"), createVNode("span", { class: "amount" }, toDisplayString(Number(__props.balance)) + " ₽", 1)]),
							createVNode("div", { class: "type-toggle" }, [createVNode("button", {
								class: { active: !isWithdrawal.value },
								onClick: ($event) => isWithdrawal.value = false
							}, " Пополнение ", 10, ["onClick"]), createVNode("button", {
								class: { active: isWithdrawal.value },
								onClick: ($event) => isWithdrawal.value = true,
								disabled: Number(__props.balance) <= 0
							}, " Снятие ", 10, ["onClick", "disabled"])]),
							createVNode("form", {
								onSubmit: withModifiers(submitBalance, ["prevent"]),
								class: "balance-form"
							}, [
								createVNode("div", { class: "form-group" }, [createVNode("label", { for: "amount" }, toDisplayString(isWithdrawal.value ? "Сумма снятия:" : "Сумма пополнения:"), 1), withDirectives(createVNode("input", {
									type: "number",
									name: "amount",
									id: "amount",
									"onUpdate:modelValue": ($event) => unref(form).amount = $event,
									min: 1,
									max: isWithdrawal.value ? Number(__props.balance) : 1e5,
									required: "",
									placeholder: "Введите сумму"
								}, null, 8, ["onUpdate:modelValue", "max"]), [[vModelText, unref(form).amount]])]),
								!isWithdrawal.value ? (openBlock(), createBlock("div", {
									key: 0,
									class: "quick-amounts"
								}, [(openBlock(), createBlock(Fragment, null, renderList(quickAmounts, (amount) => {
									return createVNode("button", {
										type: "button",
										key: amount,
										onClick: ($event) => unref(form).amount = amount,
										class: { active: unref(form).amount === amount }
									}, toDisplayString(amount) + " ₽ ", 11, ["onClick"]);
								}), 64))])) : (openBlock(), createBlock("div", {
									key: 1,
									class: "quick-amounts"
								}, [(openBlock(), createBlock(Fragment, null, renderList(withdrawalAmounts, (amount) => {
									return createVNode("button", {
										type: "button",
										key: amount,
										onClick: ($event) => unref(form).amount = amount,
										class: { active: unref(form).amount === amount }
									}, toDisplayString(amount) + " ₽ ", 11, ["onClick"]);
								}), 64))])),
								createVNode("button", {
									type: "submit",
									class: "btn-submit",
									disabled: unref(form).processing
								}, toDisplayString(unref(form).processing ? isWithdrawal.value ? "Снятие..." : "Пополнение..." : isWithdrawal.value ? "Снять средства" : "Пополнить баланс"), 9, ["disabled"])
							], 32)
						])
					])])];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup$15 = _sfc_main$15.setup;
_sfc_main$15.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Balance/Index.vue");
	return _sfc_setup$15 ? _sfc_setup$15(props, ctx) : void 0;
};
var Index_default$2 = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$15, [["__scopeId", "data-v-92cdf31e"]]);
//#endregion
//#region resources/js/composables/usePostPreviewsCache.js
var postPreviewsCache = {};
function addToCache(postId, data) {
	postPreviewsCache[postId] = data;
}
//#endregion
//#region resources/js/Pages/Chat/Chats.vue
var Chats_exports = /* @__PURE__ */ __exportAll({ default: () => Chats_default });
var _sfc_main$14 = {
	__name: "Chats",
	__ssrInlineRender: true,
	props: {
		chats: Array,
		activeChat: {
			type: Object,
			default: null
		}
	},
	setup(__props) {
		const props = __props;
		const page = usePage();
		useDarkMode();
		const form = useForm({
			content: "",
			photo: null,
			video: null,
			document: null
		});
		function toLocalPath(url) {
			try {
				const parsed = new URL(url);
				const currentHost = window.location.hostname;
				if (parsed.hostname === currentHost || parsed.hostname === "127.0.0.1" && (currentHost === "127.0.0.1" || currentHost === "localhost") || currentHost === "127.0.0.1" && parsed.hostname === "localhost") return parsed.pathname + parsed.search + parsed.hash;
			} catch (e) {
				if (url.startsWith("/")) return url;
			}
			return null;
		}
		function handleLinkClick(url) {
			const path = toLocalPath(url);
			if (path) router.visit(path);
			else window.open(url, "_blank");
		}
		function handleMessageContentClick(event) {
			const link = event.target.closest("a");
			if (link) {
				event.preventDefault();
				handleLinkClick(link.getAttribute("href"));
			}
		}
		const textareaRef = ref(null);
		const messagesRef = ref(null);
		const chatArea = ref(null);
		const photoPreviewUrl = ref(null);
		const isApplicationBlockClosed = ref(false);
		const videoPreviewUrl = ref(null);
		const documentPreviewName = ref(null);
		const showPriceModal = ref(false);
		const priceForm = ref({ proposed_price: "" });
		const priceChangeModal = ref({
			show: false,
			message: null,
			newPrice: ""
		});
		const openDisputeModal = ref(false);
		const disputeForm = ref({ reason: "" });
		const modalOpen = ref(false);
		const modalImage = ref(null);
		const modalVideo = ref(null);
		const downloadedFiles = ref(/* @__PURE__ */ new Set());
		const slideOffset = ref(0);
		const contextMenu = ref({
			show: false,
			x: 0,
			y: 0,
			message: null
		});
		const rightClickedMessage = ref(null);
		const editingMessage = ref(null);
		const selectedMessages = ref([]);
		const optionsMenu = ref({
			show: false,
			x: 15,
			y: 60
		});
		const showChatFiles = ref(false);
		const chatFilesTab = ref("media");
		const onlineUsers = ref(/* @__PURE__ */ new Set());
		const isSliding = ref(false);
		const touchStartX = ref(0);
		const touchCurrentX = ref(0);
		const isSwiping = ref(false);
		const mergeMessages = (newMessages) => {
			newMessages.forEach((newMsg) => {
				const existing = localMessages.value.find((m) => m.id === newMsg.id || m._clientId === newMsg._clientId);
				if (existing) Object.assign(existing, newMsg);
				else localMessages.value.push(newMsg);
			});
		};
		const localMessages = ref([]);
		const postPreviews = ref(postPreviewsCache);
		const isHydratingChat = ref(false);
		const showSkeleton = ref(false);
		const isSkeletonFading = ref(false);
		const isMessagesStable = ref(false);
		const initialScrollDone = ref(false);
		let stableCheckTimer = null;
		let highlightMessageId = null;
		const pendingTempIds = /* @__PURE__ */ new Set();
		const isSearching = ref(false);
		const searchQuery = ref("");
		const searchQueryRaw = ref("");
		const searchInputRef = ref(null);
		const currentMatchIndex = ref(0);
		const isGlobalSearch = ref(false);
		const searchResultsFromApi = ref([]);
		async function searchChats(query) {
			if (query.length < 2) {
				searchResultsFromApi.value = [];
				return;
			}
			router.get("/chats/search", { q: query }, {
				preserveState: true,
				preserveScroll: true,
				onSuccess: (page) => {
					searchResultsFromApi.value = page.props.searchResults || [];
				},
				onError: (errors) => {
					console.error("Search error:", errors);
					searchResultsFromApi.value = [];
				}
			});
		}
		const searchResults = computed(() => {
			const query = searchQueryRaw.value.trim();
			if (isGlobalSearch.value) return searchResultsFromApi.value;
			if (!query) return [];
			if (props.activeChat && props.activeChat.messages) return props.activeChat.messages.filter((m) => m.content && m.content.toLowerCase().includes(query.toLowerCase())).map((m) => ({
				type: "message",
				...m
			}));
			return [];
		});
		function highlight(text) {
			if (!searchQueryRaw.value) return text || "";
			const escaped = searchQueryRaw.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
			const regex = new RegExp(`(${escaped})`, "gi");
			return (text || "").replace(regex, "<mark>$1</mark>");
		}
		function startSearch() {
			searchResultsFromApi.value = [];
			searchQuery.value = "";
			searchQueryRaw.value = "";
			currentMatchIndex.value = 0;
			isGlobalSearch.value = true;
			isSearching.value = true;
			nextTick(() => {
				if (searchInputRef.value) searchInputRef.value.focus();
			});
		}
		function closeSearch() {
			searchQuery.value = "";
			searchQueryRaw.value = "";
			currentMatchIndex.value = 0;
			searchResultsFromApi.value = [];
			router.get("/chats", {}, {
				preserveState: true,
				onSuccess: () => {
					isSearching.value = false;
					isGlobalSearch.value = false;
				}
			});
		}
		function scrollToMessage(messageId) {
			if (!messageId) return;
			nextTick(() => {
				const el = document.querySelector(`[data-message-id="${messageId}"]`);
				if (el) el.scrollIntoView({
					behavior: "smooth",
					block: "center"
				});
			});
		}
		function getMessageId(result) {
			return result.messageId || result.id;
		}
		function goToMessage(result) {
			if (isGlobalSearch.value) {
				const messageId = result.messageId;
				const url = messageId ? `/chats/${result.chatId}?highlight=${messageId}` : `/chats/${result.chatId}`;
				searchQuery.value = "";
				searchQueryRaw.value = "";
				searchResultsFromApi.value = [];
				isSearching.value = false;
				isGlobalSearch.value = false;
				currentMatchIndex.value = 0;
				router.visit(url);
				return;
			}
			const messageId = getMessageId(result);
			const messageIndex = props.activeChat?.messages?.findIndex((m) => m.id === messageId);
			if (messageIndex !== void 0 && messageIndex >= 0) {
				currentMatchIndex.value = searchResults.value.findIndex((m) => getMessageId(m) === messageId);
				scrollToMessage(messageId);
			}
		}
		function nextMatch() {
			if (currentMatchIndex.value < searchResults.value.length - 1) {
				currentMatchIndex.value++;
				scrollToMessage(getMessageId(searchResults.value[currentMatchIndex.value]));
			}
		}
		function prevMatch() {
			if (currentMatchIndex.value > 0) {
				currentMatchIndex.value--;
				scrollToMessage(getMessageId(searchResults.value[currentMatchIndex.value]));
			}
		}
		watch(searchQuery, (val) => {
			searchQueryRaw.value = val;
			currentMatchIndex.value = 0;
			if (isGlobalSearch.value) searchChats(val);
			else if (searchResults.value.length > 0) scrollToMessage(searchResults.value[0].id);
		});
		const skeletonItems = computed(() => [
			{
				side: "left",
				lines: [
					"42%",
					"58%",
					"32%"
				],
				hasThirdLine: true
			},
			{
				side: "right",
				lines: ["55%", "40%"],
				hasThirdLine: false
			},
			{
				side: "left",
				lines: ["68%", "34%"],
				hasThirdLine: false
			},
			{
				side: "right",
				lines: [
					"48%",
					"62%",
					"28%"
				],
				hasThirdLine: true
			},
			{
				side: "left",
				lines: ["38%", "52%"],
				hasThirdLine: false
			},
			{
				side: "right",
				lines: ["60%", "44%"],
				hasThirdLine: false
			},
			{
				side: "left",
				lines: [
					"72%",
					"36%",
					"24%"
				],
				hasThirdLine: true
			}
		]);
		const POST_URL_REGEX = /http?:\/\/[^\/\s]+\/posts\/(\d+)/;
		function extractPostIds(content) {
			if (!content) return [];
			const ids = [];
			let match;
			const regex = new RegExp(POST_URL_REGEX.source, "g");
			while ((match = regex.exec(content)) !== null) ids.push(match[1]);
			return [...new Set(ids)];
		}
		function testPostUrl(text) {
			return new RegExp(POST_URL_REGEX.source).test(text);
		}
		async function fetchPostPreview(postId) {
			if (postPreviewsCache[postId]) return;
			postPreviewsCache[postId] = "loading";
			postPreviews.value = { ...postPreviewsCache };
			try {
				const res = await fetch(`/api/posts/${postId}/preview`);
				if (!res.ok) throw new Error("not found");
				addToCache(postId, await res.json());
				postPreviews.value = { ...postPreviewsCache };
			} catch {
				postPreviewsCache[postId] = "error";
				postPreviews.value = { ...postPreviewsCache };
			}
		}
		async function loadPreviewsForMessages(messages) {
			if (!messages) return;
			const promises = [];
			for (const msg of messages) {
				const ids = extractPostIds(msg.content);
				for (const id of ids) promises.push(fetchPostPreview(id));
			}
			await Promise.all(promises);
		}
		async function hydrateChat(messages) {
			const needsFetch = messages?.some((msg) => {
				return extractPostIds(msg.content).some((id) => !postPreviewsCache[id] || postPreviewsCache[id] === "loading");
			});
			if (stableCheckTimer) clearTimeout(stableCheckTimer);
			if (needsFetch) {
				showSkeleton.value = true;
				isHydratingChat.value = true;
				await loadPreviewsForMessages(messages);
			}
			isMessagesStable.value = false;
			initialScrollDone.value = false;
			let lastHeight = 0;
			let stableCount = 0;
			const STABLE_THRESHOLD = 3;
			const checkStable = () => {
				if (!messagesRef.value) {
					stableCheckTimer = setTimeout(checkStable, 100);
					return;
				}
				const currentHeight = messagesRef.value.scrollHeight;
				if (currentHeight === lastHeight && currentHeight > 0) {
					stableCount++;
					if (stableCount >= STABLE_THRESHOLD) {
						isMessagesStable.value = true;
						if (highlightMessageId) {
							const messageId = parseInt(highlightMessageId, 10);
							if (props.activeChat?.messages?.some((m) => m.id === messageId)) nextTick(() => scrollToMessage(messageId));
							highlightMessageId = null;
						} else scrollToBottom(true);
						initialScrollDone.value = true;
						if (needsFetch) setTimeout(() => {
							isSkeletonFading.value = true;
							setTimeout(() => {
								showSkeleton.value = false;
								isSkeletonFading.value = false;
								isHydratingChat.value = false;
							}, 500);
						}, 500);
						else isHydratingChat.value = false;
						return;
					}
				} else {
					stableCount = 0;
					lastHeight = currentHeight;
				}
				stableCheckTimer = setTimeout(checkStable, 100);
			};
			checkStable();
		}
		function getPostPreviewsFromContent(content) {
			return extractPostIds(content).map((id) => postPreviews.value[id]).filter((p) => p && p !== "loading" && p !== "error");
		}
		function renderContent(content) {
			if (!content) return "";
			let result = content.replace(/http?:\/\/[^\/\s]+\/posts\/(\d+)/g, (url, id) => `<a href="/posts/${id}" class="post-link" data-link="local">${url}</a>`);
			result = result.replace(/(https?:\/\/[^\s<]+)/g, (url) => `<a href="${url}" class="message-link" style="color:#007bff;" target="_blank" rel="noopener">${url}</a>`);
			return result;
		}
		function isOnlyPostUrl(content) {
			if (!content) return false;
			const trimmed = content.trim();
			return new RegExp(`^${POST_URL_REGEX.source.replace("\\/", "/").replace("http?", "http?s?")}$`).test(trimmed);
		}
		function truncate(text, length) {
			if (!text) return "";
			return text.length > length ? text.slice(0, length) + "…" : text;
		}
		function getChatPreview(message) {
			if (!message || !message.content) return "";
			if (testPostUrl(message.content.trim())) return message.is_mine ? "Вы поделились постом" : "поделился(лась) постом";
			return truncate(message.content, 30);
		}
		const formatAccountAge = (createdAt) => {
			const created = new Date(createdAt);
			const diffMs = /* @__PURE__ */ new Date() - created;
			const diffDays = Math.floor(diffMs / (1e3 * 60 * 60 * 24));
			if (diffDays < 30) return `${diffDays} дней назад`;
			if (diffDays < 365) return `${Math.floor(diffDays / 30)} мес. назад`;
			const years = Math.floor(diffDays / 365);
			const yearsMod10 = years % 10;
			const yearsMod100 = years % 100;
			let yearText;
			if (yearsMod100 >= 11 && yearsMod100 <= 19) yearText = "лет";
			else if (yearsMod10 === 1) yearText = "год";
			else if (yearsMod10 >= 2 && yearsMod10 <= 4) yearText = "года";
			else yearText = "лет";
			return `${years} ${yearText} назад`;
		};
		const scrollToBottom = (force = false) => {
			nextTick(() => {
				const el = messagesRef.value;
				if (!el) return;
				const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
				if (force || isNearBottom) el.scrollTop = el.scrollHeight;
			});
		};
		const autoResize = () => {
			const el = textareaRef.value;
			if (!el) return;
			el.style.height = "auto";
			el.style.height = `${el.scrollHeight}px`;
		};
		const isMobile = () => window.innerWidth <= 1e3;
		const resetForm = () => {
			form.reset("content", "photo", "video", "document");
			photoPreviewUrl.value = null;
			videoPreviewUrl.value = null;
			documentPreviewName.value = null;
			editingMessage.value = null;
		};
		const acceptApplication = () => {
			router.post(`/applications/${props.activeChat.application.id}/accept`, {}, { preserveScroll: true });
		};
		const rejectApplication = () => {
			router.post(`/applications/${props.activeChat.application.id}/reject`, {}, { preserveScroll: true });
		};
		const withdrawApplication = () => {
			router.post(`/applications/${props.activeChat.application.id}/withdraw`, {}, { preserveScroll: true });
		};
		const closeVacancy = () => {
			router.post(`/applications/${props.activeChat.application.id}/close-vacancy`, {}, { preserveScroll: true });
		};
		const confirmCompletion = () => {
			router.post(`/applications/${props.activeChat.application.id}/confirm-completion`, {}, { preserveScroll: true });
		};
		const submitDispute = () => {
			if (!disputeForm.value.reason || disputeForm.value.reason.length < 10) return;
			router.post("/disputes", {
				application_id: props.activeChat.application.id,
				reason: disputeForm.value.reason
			}, {
				preserveScroll: true,
				onSuccess: () => {
					openDisputeModal.value = false;
					disputeForm.value.reason = "";
				}
			});
		};
		const getDaysRemaining = (completedAt) => {
			const diffTime = new Date(completedAt) - /* @__PURE__ */ new Date();
			const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
			return Math.max(0, 7 - diffDays);
		};
		const submitPriceProposal = () => {
			if (!priceForm.value.proposed_price || priceForm.value.proposed_price <= 0) return;
			router.post(`/applications/${props.activeChat.application.id}/propose-price`, { proposed_price: priceForm.value.proposed_price }, {
				preserveScroll: true,
				onSuccess: () => {
					showPriceModal.value = false;
					priceForm.value.proposed_price = "";
				}
			});
		};
		const acceptPriceProposal = (message) => {
			router.post(`/messages/${message.id}/accept-price`, {}, { preserveScroll: true });
		};
		const openPriceChangeModal = (message) => {
			priceChangeModal.value = {
				show: true,
				message,
				newPrice: ""
			};
		};
		const submitPriceChange = () => {
			if (!priceChangeModal.value.newPrice || priceChangeModal.value.newPrice <= 0) return;
			router.post(`/applications/${props.activeChat.application.id}/propose-price`, { proposed_price: priceChangeModal.value.newPrice }, {
				preserveScroll: true,
				onSuccess: () => {
					priceChangeModal.value = {
						show: false,
						message: null,
						newPrice: ""
					};
				}
			});
		};
		const otherUsers = computed(() => {
			if (!props.activeChat) return [];
			const currentId = page.props.auth?.user?.id;
			return props.activeChat.users.filter((u) => u.id !== currentId);
		});
		const vacancyPosition = computed(() => {
			if (!props.activeChat || !props.activeChat.application?.vacancy) return null;
			return props.activeChat.application.vacancy.position;
		});
		const vacancyPostId = computed(() => {
			if (!props.activeChat || !props.activeChat.application?.vacancy) return null;
			return props.activeChat.application.vacancy.post_id;
		});
		const showApplicationBlock = computed(() => {
			if (!props.activeChat) return false;
			if (!props.activeChat.application) return false;
			if (!["pending", "accepted"].includes(props.activeChat.application.status)) return false;
			return true;
		});
		const isVacancyAuthor = computed(() => {
			if (!props.activeChat || !props.activeChat.application) return false;
			return page.props.auth?.user?.id !== props.activeChat.application.user.id;
		});
		const canDeleteSelected = computed(() => {
			if (selectedMessages.value.length === 0) return false;
			return selectedMessages.value.every((m) => m.is_mine);
		});
		const isUserOnline = (userId) => {
			return onlineUsers.value.has(userId);
		};
		const lastReadAt = ref(null);
		const otherLastReadAt = ref(null);
		const initLastReadAt = () => {
			const raw = props.activeChat?.last_read_at;
			if (raw) {
				const date = new Date(raw);
				if (!isNaN(date.getTime())) lastReadAt.value = date;
			}
			const otherRaw = props.activeChat?.other_last_read_at;
			if (otherRaw) {
				const date = new Date(otherRaw);
				if (!isNaN(date.getTime())) otherLastReadAt.value = date;
			}
		};
		initLastReadAt();
		const getMessageStatus = (message) => {
			if (!message.is_mine) return null;
			if (message._status) return message._status;
			const readTime = otherLastReadAt.value ? new Date(otherLastReadAt.value).getTime() : 0;
			return new Date(message.created_at).getTime() < readTime ? "read" : "sent";
		};
		const canSend = computed(() => {
			if (editingMessage.value) return true;
			return form.content && form.content.trim().length > 0 || !!form.photo || !!form.video || !!form.document;
		});
		const chatMediaFiles = computed(() => {
			if (!props.activeChat || !props.activeChat.messages) return [];
			const media = [];
			for (const msg of props.activeChat.messages) {
				if (msg.image_url) media.push({
					id: msg.id,
					type: "image",
					url: msg.image_url
				});
				if (msg.video_url) media.push({
					id: msg.id,
					type: "video",
					url: msg.video_url
				});
			}
			return media.reverse();
		});
		const chatDocFiles = computed(() => {
			if (!props.activeChat || !props.activeChat.messages) return [];
			return props.activeChat.messages.filter((m) => m.file_url && m.file_name).reverse();
		});
		const chatLinks = computed(() => {
			if (!props.activeChat || !props.activeChat.messages) return [];
			const links = [];
			const URL_REGEX = /https?:\/\/[^\s]+/g;
			for (const msg of props.activeChat.messages) if (msg.content) {
				const matches = msg.content.match(URL_REGEX);
				if (matches) for (const url of matches) links.push({
					id: msg.id + "-" + url,
					content: url,
					url,
					time: msg.time
				});
			}
			return links.reverse();
		});
		const openImage = (url) => {
			modalImage.value = url;
			modalVideo.value = null;
			modalOpen.value = true;
		};
		const openVideo = (url) => {
			modalVideo.value = url;
			modalImage.value = null;
			modalOpen.value = true;
		};
		const closeModal = () => {
			modalOpen.value = false;
			modalImage.value = null;
			modalVideo.value = null;
		};
		const cancelPreview = () => {
			form.reset("photo", "video", "document");
			photoPreviewUrl.value = null;
			videoPreviewUrl.value = null;
			documentPreviewName.value = null;
		};
		const selectOtherFile = () => {
			const input = document.createElement("input");
			input.type = "file";
			input.accept = "*/*";
			input.onchange = (event) => {
				const file = event.target.files[0];
				if (file) {
					form.photo = null;
					form.video = null;
					form.document = null;
					if (file.type.startsWith("image/")) {
						form.photo = file;
						const reader = new FileReader();
						reader.onload = (e) => {
							photoPreviewUrl.value = e.target.result;
							videoPreviewUrl.value = null;
							documentPreviewName.value = null;
						};
						reader.readAsDataURL(file);
					} else if (file.type.startsWith("video/")) {
						form.video = file;
						const reader = new FileReader();
						reader.onload = (e) => {
							videoPreviewUrl.value = e.target.result;
							photoPreviewUrl.value = null;
							documentPreviewName.value = null;
						};
						reader.readAsDataURL(file);
					} else {
						form.document = file;
						documentPreviewName.value = file.name;
						photoPreviewUrl.value = null;
						videoPreviewUrl.value = null;
					}
				}
			};
			input.click();
		};
		const persistDownloaded = () => {
			try {
				const arr = Array.from(downloadedFiles.value);
				window.localStorage.setItem("visket_downloaded_files", JSON.stringify(arr));
			} catch (e) {
				console.error("Не удалось сохранить состояние скачанных файлов", e);
			}
		};
		const isFileDownloaded = (message) => {
			if (!message.file_name) return false;
			return downloadedFiles.value.has(message.file_name);
		};
		const downloadFile = (message) => {
			if (!message.file_url) return;
			const link = document.createElement("a");
			link.href = message.file_url;
			link.download = message.file_name || "";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			if (message.file_name) {
				downloadedFiles.value.add(message.file_name);
				persistDownloaded();
			}
		};
		const sendMessage = () => {
			if (!props.activeChat || !canSend.value) return;
			const tempId = "temp_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
			const currentUser = page.props.auth?.user;
			if (!editingMessage.value && currentUser) {
				localMessages.value.push({
					id: tempId,
					_clientId: tempId,
					content: form.content,
					is_mine: true,
					user: {
						id: currentUser.id,
						name: currentUser.name,
						avatar_url: currentUser.avatar ? `/storage/${currentUser.avatar}` : "/images/User-avatar.png"
					},
					time: (/* @__PURE__ */ new Date()).toLocaleTimeString("ru-RU", {
						hour: "2-digit",
						minute: "2-digit"
					}),
					created_at: (/* @__PURE__ */ new Date()).toISOString(),
					image_url: photoPreviewUrl.value,
					video_url: videoPreviewUrl.value,
					_status: "sending"
				});
				pendingTempIds.add(tempId);
				scrollToBottom(true);
			}
			const url = editingMessage.value ? `/chats/${props.activeChat.id}/messages/${editingMessage.value.id}` : `/chats/${props.activeChat.id}/messages`;
			const wasEditing = !!editingMessage.value;
			form[wasEditing ? "put" : "post"](url, {
				preserveScroll: true,
				onSuccess: (page) => {
					const newMessages = page.props.activeChat?.messages ?? [];
					const realMessage = newMessages[newMessages.length - 1];
					if (!wasEditing && realMessage) {
						const tempMessage = localMessages.value.find((m) => m._clientId === tempId);
						if (tempMessage) {
							Object.assign(tempMessage, realMessage);
							tempMessage._clientId = tempId;
							tempMessage._status = "sent";
						} else mergeMessages(newMessages);
					} else mergeMessages(newMessages.map((m) => ({
						...m,
						_clientId: m._clientId || m.id
					})));
					pendingTempIds.delete(tempId);
					resetForm();
					if (!wasEditing) scrollToBottom(true);
				},
				onError: () => {
					pendingTempIds.delete(tempId);
					const tempMessage = localMessages.value.find((m) => m._clientId === tempId);
					if (tempMessage) tempMessage._status = "failed";
				}
			});
		};
		const formatSize = (bytes) => {
			if (!bytes) return "";
			const kb = bytes / 1024;
			if (kb < 1024) return kb.toFixed(1) + " КБ";
			return (kb / 1024).toFixed(2) + " МБ";
		};
		const showContextMenu = (event, message) => {
			contextMenu.value = {
				show: true,
				x: event.clientX,
				y: event.clientY,
				message
			};
			rightClickedMessage.value = message;
		};
		const hideContextMenu = () => {
			contextMenu.value.show = false;
			rightClickedMessage.value = null;
		};
		const deleteMessage = (message) => {
			if (confirm("Вы уверены, что хотите удалить это сообщение?")) router.delete(`/chats/${props.activeChat.id}/messages/${message.id}`, {
				preserveScroll: true,
				onSuccess: () => {
					hideContextMenu();
				}
			});
			else hideContextMenu();
		};
		const editMessage = (message) => {
			editingMessage.value = message;
			form.content = message.content || "";
			photoPreviewUrl.value = message.image_url || null;
			videoPreviewUrl.value = message.video_url || null;
			documentPreviewName.value = message.file_url ? message.file_name : null;
			hideContextMenu();
			nextTick(() => {
				if (textareaRef.value) {
					textareaRef.value.focus();
					autoResize();
				}
			});
		};
		const cancelEdit = () => {
			resetForm();
		};
		const toggleMessageSelection = (message, event) => {
			if (event?.target.closest("a")) return;
			const index = selectedMessages.value.findIndex((m) => m.id === message.id);
			if (index > -1) selectedMessages.value.splice(index, 1);
			else selectedMessages.value.push(message);
		};
		const replyToMessage = (message) => {
			form.content = message.content ? `>> ${message.user.name}: ${message.content.slice(0, 50)}${message.content.length > 50 ? "…" : ""}\n` : `>> ${message.user.name}\n`;
			hideContextMenu();
			nextTick(() => {
				if (textareaRef.value) {
					textareaRef.value.focus();
					autoResize();
				}
			});
		};
		const clearSelection = () => {
			selectedMessages.value = [];
		};
		const deleteSelectedMessages = async () => {
			if (selectedMessages.value.length === 0) return;
			const messagesToDelete = selectedMessages.value.filter((m) => m.is_mine);
			if (messagesToDelete.length === 0) return;
			const messageIds = messagesToDelete.map((m) => m.id);
			const confirmMsg = messageIds.length === selectedMessages.value.length ? `Удалить ${messageIds.length} сообщение(й)?` : `Удалить ${messageIds.length} из ${selectedMessages.value.length} выбранных сообщений?`;
			if (!confirm(confirmMsg)) return;
			const backup = [...localMessages.value];
			localMessages.value = localMessages.value.filter((m) => !messageIds.includes(m.id));
			selectedMessages.value = [];
			router.delete(`/chats/${props.activeChat.id}/messages`, {
				data: { ids: messageIds },
				preserveScroll: true,
				onSuccess: () => {
					hideContextMenu();
				},
				onError: () => {
					localMessages.value = backup;
					selectedMessages.value = messagesToDelete;
				}
			});
		};
		const toggleOptionsMenu = () => {
			optionsMenu.value.show = !optionsMenu.value.show;
		};
		const hideOptionsMenu = () => {
			optionsMenu.value.show = false;
		};
		const handleChatFiles = () => {
			showChatFiles.value = true;
			hideOptionsMenu();
		};
		const closeChatFiles = () => {
			showChatFiles.value = false;
		};
		const handleAddParticipant = () => {
			console.log("Добавить участника");
			hideOptionsMenu();
		};
		const handleSearchChat = () => {
			isGlobalSearch.value = false;
			isSearching.value = true;
			hideOptionsMenu();
			nextTick(() => {
				if (searchInputRef.value) searchInputRef.value.focus();
			});
		};
		const handleDeleteChat = () => {
			if (confirm("Вы уверены, что хотите удалить этот чат?")) console.log("Удалить чат");
			hideOptionsMenu();
		};
		const handleBackClick = () => {
			if (!isMobile()) {
				router.get("/chats");
				return;
			}
			isSliding.value = true;
			const el = chatArea.value;
			if (!el) {
				router.get("/chats");
				return;
			}
			const onTransitionEnd = () => {
				el.removeEventListener("transitionend", onTransitionEnd);
				router.get("/chats", {}, { preserveScroll: true });
			};
			el.addEventListener("transitionend", onTransitionEnd);
		};
		const toggleApplicationBlock = () => {
			isApplicationBlockClosed.value = !isApplicationBlockClosed.value;
			try {
				localStorage.setItem("visket_application_block_closed", isApplicationBlockClosed.value ? "1" : "0");
			} catch (e) {
				console.error("Не удалось сохранить состояние", e);
			}
			nextTick(() => {
				scrollToBottom(true);
			});
		};
		const onTouchStart = (e) => {
			if (!isMobile()) return;
			touchStartX.value = e.touches[0].clientX;
			touchCurrentX.value = e.touches[0].clientX;
			isSwiping.value = touchStartX.value < 50;
			slideOffset.value = 0;
		};
		const onTouchMove = (e) => {
			if (!isMobile() || !isSwiping.value) return;
			touchCurrentX.value = e.touches[0].clientX;
			const deltaX = touchCurrentX.value - touchStartX.value;
			if (deltaX > 0) slideOffset.value = deltaX;
		};
		const onTouchEnd = () => {
			if (!isMobile() || !isSwiping.value) return;
			if (touchCurrentX.value - touchStartX.value > 100) {
				isSliding.value = true;
				slideOffset.value = 0;
				setTimeout(() => {
					router.visit("/chats");
				}, 300);
			} else slideOffset.value = 0;
			isSwiping.value = false;
		};
		const syncBodyClass = (hasActiveChat) => {
			if (hasActiveChat) document.body.classList.add("mobile-chat-open");
			else document.body.classList.remove("mobile-chat-open");
		};
		const resizeObserver = new ResizeObserver(() => {
			if (props.activeChat && !isHydratingChat.value) scrollToBottom(true);
		});
		onMounted(async () => {
			try {
				const raw = window.localStorage.getItem("visket_downloaded_files");
				if (raw) {
					const arr = JSON.parse(raw);
					downloadedFiles.value = new Set(Array.isArray(arr) ? arr : []);
				}
			} catch (e) {
				console.error("Не удалось прочитать состояние скачанных файлов", e);
			}
			try {
				if (localStorage.getItem("visket_application_block_closed") === "1") isApplicationBlockClosed.value = true;
			} catch (e) {
				console.error("Не удалось прочитать состояние блока", e);
			}
			document.addEventListener("click", hideContextMenu);
			document.addEventListener("click", hideOptionsMenu);
			highlightMessageId = new URLSearchParams(window.location.search).get("highlight");
			syncBodyClass(!!props.activeChat);
			hydrateChat(props.activeChat?.messages);
			if (messagesRef.value) resizeObserver.observe(messagesRef.value);
			if (chatArea.value) resizeObserver.observe(chatArea.value);
			try {
				const { default: Pusher } = await import("pusher-js");
				window.Pusher = Pusher;
				window.Echo = new Echo({
					broadcaster: "reverb",
					key: "mot6g4guh0q7w6ofocls",
					wsHost: "localhost",
					wsPort: 8080,
					wssPort: 8080,
					forceTLS: false,
					enabledTransports: ["ws"]
				});
				if (props.activeChat) window.Echo.private(`chat.${props.activeChat.id}`).listen(".message.sent", (e) => {
					mergeMessages(page.props.activeChat?.messages ?? []);
				}).listen(".message.updated", (e) => {
					router.reload({ only: ["activeChat"] });
				}).listen(".message.deleted", (e) => {
					mergeMessages(page.props.activeChat?.messages ?? []);
				}).listen(".messages.read", (e) => {
					const otherUser = otherUsers.value[0];
					if (otherUser && e.user_id === otherUser.id && e.last_read_at) otherLastReadAt.value = new Date(e.last_read_at);
				});
				window.Echo.join("presence-online").here((users) => {
					onlineUsers.value = new Set(users.map((u) => u.id));
				}).joining((user) => {
					onlineUsers.value.add(user.id);
				}).leaving((user) => {
					onlineUsers.value.delete(user.id);
				});
			} catch (error) {
				console.error("Failed to initialize Echo:", error);
			}
		});
		onUnmounted(() => {
			document.removeEventListener("click", hideContextMenu);
			document.removeEventListener("click", hideOptionsMenu);
			document.body.classList.remove("mobile-chat-open");
			if (props.activeChat && window.Echo) window.Echo.leave(`chat.${props.activeChat.id}`);
			if (window.Echo) window.Echo.leave("presence-online");
			if (stableCheckTimer) clearTimeout(stableCheckTimer);
			resizeObserver.disconnect();
		});
		watch(() => props.activeChat, (newVal) => {
			syncBodyClass(!!newVal);
		});
		watch(() => props.activeChat?.id, (newChatId, oldChatId) => {
			if (!window.Echo) return;
			if (oldChatId) window.Echo.leave(`chat.${oldChatId}`);
			if (newChatId) window.Echo.private(`chat.${newChatId}`).listen(".message.sent", (e) => {
				mergeMessages(page.props.activeChat?.messages ?? []);
			}).listen(".message.updated", (e) => {
				router.reload({ only: ["activeChat"] });
			}).listen(".message.deleted", (e) => {
				mergeMessages(page.props.activeChat?.messages ?? []);
			}).listen(".messages.read", (e) => {
				const otherUser = otherUsers.value[0];
				if (otherUser && e.user_id === otherUser.id && e.last_read_at) otherLastReadAt.value = new Date(e.last_read_at);
			});
		});
		watch(() => props.activeChat?.messages, (msgs) => {
			if (pendingTempIds.size > 0) return;
			if (msgs && msgs.length > 0 && localMessages.value.length === 0) localMessages.value = msgs.map((m) => ({
				...m,
				_clientId: m._clientId || m.id
			}));
		}, { immediate: true });
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(AppLayout_default, _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(unref(Head), { title: "Чаты" }, null, _parent, _scopeId));
						_push(`<div class="chat-container" data-v-592947d2${_scopeId}><div class="chat-list" data-v-592947d2${_scopeId}>`);
						if (!isSearching.value) _push(`<div class="chat-list-header" data-v-592947d2${_scopeId}><h2 data-v-592947d2${_scopeId}>Чаты</h2><button type="button" class="search-btn" data-v-592947d2${_scopeId}><img src="/images/search.svg" alt="Поиск" data-v-592947d2${_scopeId}></button></div>`);
						else _push(`<div class="search-header" data-v-592947d2${_scopeId}><input${ssrRenderAttr("value", searchQuery.value)} type="text"${ssrRenderAttr("placeholder", isGlobalSearch.value ? "Поиск чатов и сообщений..." : "Поиск в чате...")} class="search-input" data-v-592947d2${_scopeId}><button type="button" class="search-close" data-v-592947d2${_scopeId}><img src="/images/close.svg" alt="Закрыть" data-v-592947d2${_scopeId}></button></div>`);
						if (!isSearching.value) {
							_push(`<!--[-->`);
							ssrRenderList(__props.chats, (chat) => {
								_push(`<div class="${ssrRenderClass([{
									active: __props.activeChat && chat.id === __props.activeChat.id,
									"has-unread": chat.unread_count > 0,
									"accepted-chat": chat.application && chat.application.status === "accepted"
								}, "chat-item"])}" tabindex="0" data-v-592947d2${_scopeId}>`);
								if (chat.other_user) {
									_push(`<div class="chat-user-info" data-v-592947d2${_scopeId}><div class="avatar-wrapper" data-v-592947d2${_scopeId}><img${ssrRenderAttr("src", chat.other_user.avatar_url)} class="chat-avatar" data-v-592947d2${_scopeId}>`);
									if (isUserOnline(chat.other_user.id)) _push(`<span class="online-indicator" data-v-592947d2${_scopeId}></span>`);
									else _push(`<!---->`);
									_push(`</div><div data-v-592947d2${_scopeId}><h3 data-v-592947d2${_scopeId}>${ssrInterpolate(chat.other_user.name)}</h3>`);
									if (chat.latest_message) _push(`<p class="${ssrRenderClass([{ unread: chat.unread_count > 0 }, "chat-preview"])}" data-v-592947d2${_scopeId}>${ssrInterpolate(getChatPreview(chat.latest_message))}</p>`);
									else _push(`<!---->`);
									_push(`</div></div>`);
								} else _push(`<!---->`);
								_push(`<div class="chat-meta" data-v-592947d2${_scopeId}>`);
								if (chat.unread_count > 0) _push(`<span class="unread-badge" data-v-592947d2${_scopeId}>${ssrInterpolate(chat.unread_count > 99 ? "99+" : chat.unread_count)}</span>`);
								else _push(`<!---->`);
								_push(`</div></div>`);
							});
							_push(`<!--]-->`);
						} else _push(`<!---->`);
						if (isSearching.value) {
							_push(`<div class="search-results" data-v-592947d2${_scopeId}>`);
							if (searchResults.value.length === 0) _push(`<div class="search-no-results" data-v-592947d2${_scopeId}> Ничего не найдено </div>`);
							else _push(`<!---->`);
							_push(`<!--[-->`);
							ssrRenderList(searchResults.value, (result) => {
								_push(`<div class="search-result-item" data-v-592947d2${_scopeId}><img${ssrRenderAttr("src", result.user.avatar_url)} class="chat-avatar" data-v-592947d2${_scopeId}><div class="search-result-content" data-v-592947d2${_scopeId}><div class="search-result-name" data-v-592947d2${_scopeId}>${ssrInterpolate(result.user.name)}</div>`);
								if (result.type === "chat") _push(`<div class="search-result-type" data-v-592947d2${_scopeId}>Чат</div>`);
								else _push(`<div class="search-result-text" data-v-592947d2${_scopeId}>${highlight(result.content) ?? ""}</div>`);
								_push(`</div></div>`);
							});
							_push(`<!--]--></div>`);
						} else _push(`<!---->`);
						_push(`</div><div class="${ssrRenderClass([{
							active: !!__props.activeChat,
							sliding: isSliding.value
						}, "chat-area"])}" style="${ssrRenderStyle(slideOffset.value > 0 ? { transform: `translateX(${slideOffset.value}px)` } : {})}" data-v-592947d2${_scopeId}>`);
						if (__props.activeChat) {
							_push(`<!--[--><div class="chat-header" data-v-592947d2${_scopeId}><button type="button" class="back" data-v-592947d2${_scopeId}><img src="/images/arrow-left.svg" alt="назад" data-v-592947d2${_scopeId}></button><div class="chat-header-mid" data-v-592947d2${_scopeId}>`);
							if (otherUsers.value.length > 0) _push(ssrRenderComponent(unref(Link), {
								href: `/profile/${otherUsers.value[0].id}`,
								class: "chat-header-user"
							}, {
								default: withCtx((_, _push, _parent, _scopeId) => {
									if (_push) {
										_push(`<div class="avatar-wrapper" data-v-592947d2${_scopeId}><img${ssrRenderAttr("src", otherUsers.value[0].avatar_url)} class="chat-avatar" data-v-592947d2${_scopeId}>`);
										if (isUserOnline(otherUsers.value[0].id)) _push(`<span class="online-indicator" data-v-592947d2${_scopeId}></span>`);
										else _push(`<span class="offline-indicator" data-v-592947d2${_scopeId}></span>`);
										_push(`</div><h2 data-v-592947d2${_scopeId}>${ssrInterpolate(otherUsers.value[0].name)}</h2>`);
									} else return [createVNode("div", { class: "avatar-wrapper" }, [createVNode("img", {
										src: otherUsers.value[0].avatar_url,
										class: "chat-avatar"
									}, null, 8, ["src"]), isUserOnline(otherUsers.value[0].id) ? (openBlock(), createBlock("span", {
										key: 0,
										class: "online-indicator"
									})) : (openBlock(), createBlock("span", {
										key: 1,
										class: "offline-indicator"
									}))]), createVNode("h2", null, toDisplayString(otherUsers.value[0].name), 1)];
								}),
								_: 1
							}, _parent, _scopeId));
							else _push(`<!---->`);
							if (vacancyPostId.value) _push(`<span class="vacancy-link" data-v-592947d2${_scopeId}>${ssrInterpolate(isVacancyAuthor.value ? "откликнулся на" : "автор вакансии")}</span>`);
							else _push(`<!---->`);
							_push(ssrRenderComponent(unref(Link), { href: `/posts/${vacancyPostId.value}` }, {
								default: withCtx((_, _push, _parent, _scopeId) => {
									if (_push) _push(`<h2 data-v-592947d2${_scopeId}>${ssrInterpolate(vacancyPosition.value)}</h2>`);
									else return [createVNode("h2", null, toDisplayString(vacancyPosition.value), 1)];
								}),
								_: 1
							}, _parent, _scopeId));
							_push(`</div><img class="chat-options" src="/images/dots.svg" alt="опции" data-v-592947d2${_scopeId}></div>`);
							if (isSearching.value && !isGlobalSearch.value && __props.activeChat) _push(`<div class="search-navigation" data-v-592947d2${_scopeId}><button type="button" class="search-nav-btn"${ssrIncludeBooleanAttr(currentMatchIndex.value <= 0) ? " disabled" : ""} data-v-592947d2${_scopeId}><img src="/images/arrow-up.svg" alt="вверх" data-v-592947d2${_scopeId}></button><span class="search-nav-counter" data-v-592947d2${_scopeId}>${ssrInterpolate(searchResults.value.length > 0 ? currentMatchIndex.value + 1 : 0)} / ${ssrInterpolate(searchResults.value.length)}</span><button type="button" class="search-nav-btn"${ssrIncludeBooleanAttr(currentMatchIndex.value >= searchResults.value.length - 1) ? " disabled" : ""} data-v-592947d2${_scopeId}><img src="/images/arrow-up.svg" alt="вниз" style="${ssrRenderStyle({ "transform": "rotate(180deg)" })}" data-v-592947d2${_scopeId}></button></div>`);
							else _push(`<!---->`);
							if (optionsMenu.value.show) _push(`<div class="options-menu" style="${ssrRenderStyle({
								right: optionsMenu.value.x + "px",
								top: optionsMenu.value.y + 70 + "px"
							})}" data-v-592947d2${_scopeId}><div class="options-menu-item" data-v-592947d2${_scopeId}>Файлы чата</div><div class="options-menu-item" data-v-592947d2${_scopeId}>Добавить участника в чат</div><div class="options-menu-item" data-v-592947d2${_scopeId}>Поиск по чату</div><div class="options-menu-item delete" data-v-592947d2${_scopeId}>Удалить чат</div></div>`);
							else _push(`<!---->`);
							if (showApplicationBlock.value) {
								_push(`<div class="${ssrRenderClass([{ closed: isApplicationBlockClosed.value }, "application-block"])}" data-v-592947d2${_scopeId}><div class="application-toggle" data-v-592947d2${_scopeId}><button type="button" class="application-toggle-btn" data-v-592947d2${_scopeId}><img src="/images/arrow-up.svg" alt="Toggle" class="${ssrRenderClass([{ flipped: isApplicationBlockClosed.value }, "toggle-arrow"])}" data-v-592947d2${_scopeId}></button></div><div class="application-card" style="${ssrRenderStyle(!isApplicationBlockClosed.value ? null : { display: "none" })}" data-v-592947d2${_scopeId}><img${ssrRenderAttr("src", __props.activeChat.application.user.avatar_url)} class="application-avatar" data-v-592947d2${_scopeId}><div class="name" data-v-592947d2${_scopeId}><h3 data-v-592947d2${_scopeId}>${ssrInterpolate(__props.activeChat.application.user.name)}</h3><span class="${ssrRenderClass([{ online: isUserOnline(otherUsers.value[0].id) }, "user-status"])}" data-v-592947d2${_scopeId}>${ssrInterpolate(isUserOnline(otherUsers.value[0].id) ? "онлайн" : "оффлайн")}</span></div><p class="account-age" data-v-592947d2${_scopeId}>Аккаунт создан ${ssrInterpolate(formatAccountAge(__props.activeChat.application.user.created_at))}</p>`);
								if (__props.activeChat.application.user.rating) _push(`<div class="application-rating" data-v-592947d2${_scopeId}><span data-v-592947d2${_scopeId}>Рейтинг: ${ssrInterpolate(__props.activeChat.application.user.rating)}</span></div>`);
								else _push(`<!---->`);
								_push(`<div class="application-cover-letter" data-v-592947d2${_scopeId}><h4 data-v-592947d2${_scopeId}>Сопроводительное письмо:</h4><p data-v-592947d2${_scopeId}>${ssrInterpolate(__props.activeChat.application.cover_letter)}</p></div>`);
								if (__props.activeChat.application.proposed_price) {
									_push(`<div class="application-price-row" data-v-592947d2${_scopeId}><div class="application-price" data-v-592947d2${_scopeId}><span class="label" data-v-592947d2${_scopeId}>Предложенная цена:</span><span class="value" data-v-592947d2${_scopeId}>${ssrInterpolate(__props.activeChat.application.proposed_price)} ₽</span></div>`);
									if (isVacancyAuthor.value && __props.activeChat.application.status === "pending") _push(`<button type="button" class="price-edit-btn" data-v-592947d2${_scopeId}><img src="/images/edit.svg" alt="Изменить цену" data-v-592947d2${_scopeId}></button>`);
									else _push(`<!---->`);
									_push(`</div>`);
								} else _push(`<!---->`);
								if (__props.activeChat.application.completed_at && !__props.activeChat.application.transaction?.completed_at) _push(`<div class="application-status" data-v-592947d2${_scopeId}><span class="status-badge waiting" data-v-592947d2${_scopeId}>⏳ Ожидание зачисления: ${ssrInterpolate(getDaysRemaining(__props.activeChat.application.completed_at))} дн.</span></div>`);
								else _push(`<!---->`);
								if (__props.activeChat.application.dispute && __props.activeChat.application.dispute.status === "open") _push(`<div class="application-status" data-v-592947d2${_scopeId}><span class="status-badge dispute" data-v-592947d2${_scopeId}>⚠️ Открыт спор</span></div>`);
								else _push(`<!---->`);
								if (isVacancyAuthor.value) {
									_push(`<div class="application-actions" data-v-592947d2${_scopeId}>`);
									if (__props.activeChat.application.status === "pending") _push(`<!--[--><form data-v-592947d2${_scopeId}><button type="submit" class="accept-btn" data-v-592947d2${_scopeId}>Принять отклик</button></form><form data-v-592947d2${_scopeId}><button type="submit" class="reject-btn" data-v-592947d2${_scopeId}>Отклонить</button></form><!--]-->`);
									else if (__props.activeChat.application.status === "accepted") {
										_push(`<!--[-->`);
										if (!__props.activeChat.application.completed_at && !__props.activeChat.application.dispute) _push(`<form data-v-592947d2${_scopeId}><button type="submit" class="accept-btn" data-v-592947d2${_scopeId}>Подтвердить завершение</button></form>`);
										else _push(`<!---->`);
										_push(`<form data-v-592947d2${_scopeId}><button type="submit" class="withdraw-btn" data-v-592947d2${_scopeId}>Отменить</button></form><form data-v-592947d2${_scopeId}><button type="submit" class="close-btn" data-v-592947d2${_scopeId}>Закрыть вакансию</button></form><!--]-->`);
									} else _push(`<!---->`);
									_push(`</div>`);
								} else _push(`<!---->`);
								if (!isVacancyAuthor.value && __props.activeChat.application.status === "accepted" && !__props.activeChat.application.dispute) _push(`<div class="application-actions" data-v-592947d2${_scopeId}><button type="button" class="dispute-btn" data-v-592947d2${_scopeId}> Открыть спор </button></div>`);
								else _push(`<!---->`);
								_push(`</div></div>`);
							} else _push(`<!---->`);
							_push(`<div class="chat-messages" data-v-592947d2${_scopeId}><div class="chat-messages-inner" data-v-592947d2${_scopeId}><div${ssrRenderAttrs({
								name: "messages",
								class: "chat-messages-content"
							})} data-v-592947d2>`);
							ssrRenderList(localMessages.value, (message, index) => {
								_push(`<div${ssrRenderAttr("data-message-id", message.id)} class="${ssrRenderClass([{
									"right-clicked": rightClickedMessage.value && rightClickedMessage.value.id === message.id,
									"selected": selectedMessages.value.some((m) => m.id === message.id),
									"search-highlighted": isSearching.value && searchResults.value[currentMatchIndex.value]?.id === message.id
								}, "message-container"])}" data-v-592947d2${_scopeId}><img${ssrRenderAttr("src", message.user.avatar_url)} class="chat-avatar" data-v-592947d2${_scopeId}><div class="${ssrRenderClass([{
									"my-message": message.is_mine,
									"shared-post": isOnlyPostUrl(message.content)
								}, "message"])}" data-v-592947d2${_scopeId}>`);
								if (message.image_url) _push(`<img${ssrRenderAttr("src", message.image_url)} alt="Изображение" class="message-image" data-v-592947d2${_scopeId}>`);
								else _push(`<!---->`);
								if (message.video_url) _push(`<video${ssrRenderAttr("src", message.video_url)} class="message-video" controls data-v-592947d2${_scopeId}></video>`);
								else _push(`<!---->`);
								_push(`<div class="message-content" data-v-592947d2${_scopeId}>`);
								if (message.content && !isOnlyPostUrl(message.content)) _push(`<span data-v-592947d2${_scopeId}>${renderContent(message.content) ?? ""}</span>`);
								else _push(`<!---->`);
								_push(`<!--[-->`);
								ssrRenderList(getPostPreviewsFromContent(message.content), (preview) => {
									_push(`<div class="${ssrRenderClass([{ "shared-post-card": isOnlyPostUrl(message.content) }, "post-preview-card"])}" data-v-592947d2${_scopeId}>`);
									if (preview.image_url) _push(`<img${ssrRenderAttr("src", preview.image_url)} class="post-preview-img" alt="" data-v-592947d2${_scopeId}>`);
									else _push(`<!---->`);
									_push(`<div class="post-preview-body" data-v-592947d2${_scopeId}><div class="post-preview-title" data-v-592947d2${_scopeId}>${ssrInterpolate(preview.title)}</div>`);
									if (preview.description) _push(`<div class="post-preview-desc" data-v-592947d2${_scopeId}>${ssrInterpolate(preview.description.slice(0, 80))}${ssrInterpolate(preview.description.length > 80 ? "…" : "")}</div>`);
									else _push(`<!---->`);
									_push(`</div></div>`);
								});
								_push(`<!--]-->`);
								if (message.file_url) {
									_push(`<div class="file-attachment" data-v-592947d2${_scopeId}><button type="button" class="file-download-circle"${ssrRenderAttr("title", isFileDownloaded(message) ? "Скачано" : "Скачать")} data-v-592947d2${_scopeId}>`);
									if (!isFileDownloaded(message)) _push(`<span data-v-592947d2${_scopeId}><img src="/images/download.svg" alt="Скачать" data-v-592947d2${_scopeId}></span>`);
									else _push(`<span data-v-592947d2${_scopeId}><img src="/images/document.svg" alt="Файл" data-v-592947d2${_scopeId}></span>`);
									_push(`</button><div class="file-meta" data-v-592947d2${_scopeId}><div class="file-name" data-v-592947d2${_scopeId}>${ssrInterpolate(message.file_name || "Файл")}</div>`);
									if (message.file_size) _push(`<div class="file-size" data-v-592947d2${_scopeId}>${ssrInterpolate(formatSize(message.file_size))}</div>`);
									else _push(`<!---->`);
									_push(`</div></div>`);
								} else _push(`<!---->`);
								if (message.is_price_proposal && message.price_proposal_status === "pending" && !message.is_mine) _push(`<div class="price-proposal-actions" data-v-592947d2${_scopeId}><form class="price-action-form" data-v-592947d2${_scopeId}><button type="submit" class="accept-price-btn" data-v-592947d2${_scopeId}>Принять</button></form><button type="button" class="change-price-btn" data-v-592947d2${_scopeId}>Изменить</button></div>`);
								else _push(`<!---->`);
								_push(`</div><div class="message-time" data-v-592947d2${_scopeId}><span data-v-592947d2${_scopeId}>${ssrInterpolate(message.time)}</span>`);
								if (getMessageStatus(message)) {
									_push(`<span class="${ssrRenderClass([getMessageStatus(message), "message-status"])}" data-v-592947d2${_scopeId}>`);
									if (getMessageStatus(message) === "sending") _push(`<img src="/images/loading.svg" alt="Отправляется" class="status-icon spinning" data-v-592947d2${_scopeId}>`);
									else if (getMessageStatus(message) === "sent") _push(`<img src="/images/check-mark.svg" alt="Отправлено" class="status-icon" data-v-592947d2${_scopeId}>`);
									else if (getMessageStatus(message) === "read") _push(`<img src="/images/double-check.svg" alt="Прочитано" class="status-icon" style="${ssrRenderStyle({
										"width": "16px",
										"height": "16px"
									})}" data-v-592947d2${_scopeId}>`);
									else if (getMessageStatus(message) === "failed") _push(`<img src="/images/exclamation-circle.svg" alt="Не отправлено" class="status-icon" data-v-592947d2${_scopeId}>`);
									else _push(`<!---->`);
									_push(`</span>`);
								} else _push(`<!---->`);
								_push(`</div></div></div>`);
							});
							_push(`</div>`);
							if (showSkeleton.value) {
								_push(`<div class="${ssrRenderClass([{ fading: isSkeletonFading.value }, "chat-skeleton"])}" data-v-592947d2${_scopeId}><!--[-->`);
								ssrRenderList(skeletonItems.value, (item, index) => {
									_push(`<div class="${ssrRenderClass([{ right: item.side === "right" }, "skeleton-message"])}" data-v-592947d2${_scopeId}><div class="skeleton-avatar" data-v-592947d2${_scopeId}></div><div class="skeleton-bubble" data-v-592947d2${_scopeId}><div class="skeleton-line" style="${ssrRenderStyle({ width: item.lines[0] })}" data-v-592947d2${_scopeId}></div><div class="skeleton-line short" style="${ssrRenderStyle({ width: item.lines[1] })}" data-v-592947d2${_scopeId}></div>`);
									if (item.hasThirdLine) _push(`<div class="skeleton-line tiny" style="${ssrRenderStyle({ width: item.lines[2] })}" data-v-592947d2${_scopeId}></div>`);
									else _push(`<!---->`);
									_push(`</div></div>`);
								});
								_push(`<!--]--></div>`);
							} else _push(`<!---->`);
							_push(`</div></div><form class="message-form" enctype="multipart/form-data" data-v-592947d2${_scopeId}>`);
							if (editingMessage.value) _push(`<div class="editing-indicator" data-v-592947d2${_scopeId}><span data-v-592947d2${_scopeId}>Редактирование сообщения</span><button type="button" class="cancel-edit-btn" data-v-592947d2${_scopeId}>✕</button></div>`);
							else _push(`<!---->`);
							_push(`<div class="message-input-container" data-v-592947d2${_scopeId}>`);
							if (!editingMessage.value) _push(`<div class="add" data-v-592947d2${_scopeId}><img src="/images/clip.svg" alt="Добавить вложение" data-v-592947d2${_scopeId}><div class="add-select" data-v-592947d2${_scopeId}><label data-v-592947d2${_scopeId}> Фото <input type="file" name="photo" accept="image/*" data-v-592947d2${_scopeId}></label><label data-v-592947d2${_scopeId}> Видео <input type="file" name="video" accept="video/*" data-v-592947d2${_scopeId}></label><label data-v-592947d2${_scopeId}> Документ <input type="file" name="document" data-v-592947d2${_scopeId}></label></div></div>`);
							else _push(`<!---->`);
							_push(`<textarea${ssrRenderAttr("placeholder", editingMessage.value ? "Редактируйте сообщение..." : "Введите сообщение...")} data-v-592947d2${_scopeId}>${ssrInterpolate(unref(form).content)}</textarea><button type="submit"${ssrIncludeBooleanAttr(unref(form).processing || !canSend.value) ? " disabled" : ""} data-v-592947d2${_scopeId}>${ssrInterpolate(editingMessage.value ? "Сохранить" : "Отправить")}</button></div>`);
							if (photoPreviewUrl.value || videoPreviewUrl.value || documentPreviewName.value) {
								_push(`<div class="image-preview-container" style="${ssrRenderStyle({ "display": "flex" })}" data-v-592947d2${_scopeId}>`);
								if (photoPreviewUrl.value) _push(`<img${ssrRenderAttr("src", photoPreviewUrl.value)} alt="Превью" class="image-preview" data-v-592947d2${_scopeId}>`);
								else _push(`<!---->`);
								if (videoPreviewUrl.value) _push(`<video${ssrRenderAttr("src", videoPreviewUrl.value)} class="video-preview" controls data-v-592947d2${_scopeId}></video>`);
								else _push(`<!---->`);
								if (documentPreviewName.value) _push(`<div class="file-preview" data-v-592947d2${_scopeId}> 📎 ${ssrInterpolate(documentPreviewName.value)}</div>`);
								else _push(`<!---->`);
								_push(`<div class="preview-actions" data-v-592947d2${_scopeId}><button type="button" class="select-other-btn" data-v-592947d2${_scopeId}> Выбрать другое </button>`);
								if (!editingMessage.value) _push(`<button type="button" class="cancel-preview-btn" data-v-592947d2${_scopeId}> Отмена </button>`);
								else _push(`<!---->`);
								_push(`</div></div>`);
							} else _push(`<!---->`);
							_push(`</form><!--]-->`);
						} else _push(`<div class="chat-placeholder" data-v-592947d2${_scopeId}><p data-v-592947d2${_scopeId}>Выберите чат для начала общения</p></div>`);
						_push(`</div>`);
						if (showChatFiles.value) {
							_push(`<div class="chat-files-panel" data-v-592947d2${_scopeId}><div class="chat-files-header" data-v-592947d2${_scopeId}><h3 data-v-592947d2${_scopeId}>Файлы чата</h3><button type="button" class="chat-files-close" data-v-592947d2${_scopeId}><img src="/images/close.svg" alt="Закрыть" data-v-592947d2${_scopeId}></button></div><div class="chat-files-tabs" data-v-592947d2${_scopeId}><button type="button" class="${ssrRenderClass([{ active: chatFilesTab.value === "media" }, "chat-files-tab"])}" data-v-592947d2${_scopeId}> Медиа </button><button type="button" class="${ssrRenderClass([{ active: chatFilesTab.value === "files" }, "chat-files-tab"])}" data-v-592947d2${_scopeId}> Файлы </button><button type="button" class="${ssrRenderClass([{ active: chatFilesTab.value === "links" }, "chat-files-tab"])}" data-v-592947d2${_scopeId}> Ссылки </button></div><div class="chat-files-content" data-v-592947d2${_scopeId}>`);
							if (chatFilesTab.value === "media") {
								_push(`<div class="chat-files-media" data-v-592947d2${_scopeId}>`);
								if (chatMediaFiles.value.length === 0) _push(`<div class="chat-files-empty" data-v-592947d2${_scopeId}> Нет медиафайлов </div>`);
								else {
									_push(`<div class="chat-files-grid" data-v-592947d2${_scopeId}><!--[-->`);
									ssrRenderList(chatMediaFiles.value, (media) => {
										_push(`<div class="chat-files-media-item" data-v-592947d2${_scopeId}>`);
										if (media.type === "image") _push(`<img${ssrRenderAttr("src", media.url)} alt="Медиа" data-v-592947d2${_scopeId}>`);
										else _push(`<video${ssrRenderAttr("src", media.url)} data-v-592947d2${_scopeId}></video>`);
										if (media.type === "video") _push(`<div class="play-icon" data-v-592947d2${_scopeId}>▶</div>`);
										else _push(`<!---->`);
										_push(`</div>`);
									});
									_push(`<!--]--></div>`);
								}
								_push(`</div>`);
							} else _push(`<!---->`);
							if (chatFilesTab.value === "files") {
								_push(`<div class="chat-files-list" data-v-592947d2${_scopeId}>`);
								if (chatDocFiles.value.length === 0) _push(`<div class="chat-files-empty" data-v-592947d2${_scopeId}> Нет файлов </div>`);
								else {
									_push(`<div data-v-592947d2${_scopeId}><!--[-->`);
									ssrRenderList(chatDocFiles.value, (file) => {
										_push(`<div class="chat-files-item" data-v-592947d2${_scopeId}><button type="button" class="file-download-circle" data-v-592947d2${_scopeId}><img src="/images/download.svg" alt="Скачать" data-v-592947d2${_scopeId}></button><div class="file-info" data-v-592947d2${_scopeId}><div class="file-name" data-v-592947d2${_scopeId}>${ssrInterpolate(file.file_name)}</div><div class="file-size" data-v-592947d2${_scopeId}>${ssrInterpolate(formatSize(file.file_size))}</div></div></div>`);
									});
									_push(`<!--]--></div>`);
								}
								_push(`</div>`);
							} else _push(`<!---->`);
							if (chatFilesTab.value === "links") {
								_push(`<div class="chat-files-list" data-v-592947d2${_scopeId}>`);
								if (chatLinks.value.length === 0) _push(`<div class="chat-files-empty" data-v-592947d2${_scopeId}> Нет ссылок </div>`);
								else {
									_push(`<div data-v-592947d2${_scopeId}><!--[-->`);
									ssrRenderList(chatLinks.value, (link) => {
										_push(`<div class="chat-files-link" data-v-592947d2${_scopeId}><span class="link-text" data-v-592947d2${_scopeId}>${ssrInterpolate(link.content)}</span><span class="link-time" data-v-592947d2${_scopeId}>${ssrInterpolate(link.time)}</span></div>`);
									});
									_push(`<!--]--></div>`);
								}
								_push(`</div>`);
							} else _push(`<!---->`);
							_push(`</div></div>`);
						} else _push(`<!---->`);
						_push(`</div>`);
						if (modalOpen.value && modalImage.value) _push(`<div class="modal-overlay" style="${ssrRenderStyle({ "display": "flex" })}" data-v-592947d2${_scopeId}><div class="modal-content" data-v-592947d2${_scopeId}><button class="modal-close" type="button" data-v-592947d2${_scopeId}> × </button><img${ssrRenderAttr("src", modalImage.value)} alt="Предпросмотр" data-v-592947d2${_scopeId}></div></div>`);
						else _push(`<!---->`);
						if (modalOpen.value && modalVideo.value) _push(`<div class="modal-overlay" style="${ssrRenderStyle({ "display": "flex" })}" data-v-592947d2${_scopeId}><div class="modal-content modal-video-content" data-v-592947d2${_scopeId}><button class="modal-close" type="button" data-v-592947d2${_scopeId}> × </button><video${ssrRenderAttr("src", modalVideo.value)} controls autoplay class="modal-video" data-v-592947d2${_scopeId}></video></div></div>`);
						else _push(`<!---->`);
						if (contextMenu.value.show) {
							_push(`<div class="context-menu" style="${ssrRenderStyle({
								left: contextMenu.value.x + "px",
								top: contextMenu.value.y + "px"
							})}" data-v-592947d2${_scopeId}>`);
							if (!contextMenu.value.message?.is_mine) _push(`<div class="context-menu-item" data-v-592947d2${_scopeId}> Ответить </div>`);
							else _push(`<!---->`);
							if (contextMenu.value.message?.is_mine) _push(`<div class="context-menu-item" data-v-592947d2${_scopeId}> Редактировать </div>`);
							else _push(`<!---->`);
							if (contextMenu.value.message?.is_mine) _push(`<div class="context-menu-item delete" data-v-592947d2${_scopeId}> Удалить </div>`);
							else _push(`<!---->`);
							_push(`</div>`);
						} else _push(`<!---->`);
						if (selectedMessages.value.length > 0) {
							_push(`<div class="selection-toolbar" data-v-592947d2${_scopeId}><span data-v-592947d2${_scopeId}>${ssrInterpolate(selectedMessages.value.length)} выбрано</span>`);
							if (canDeleteSelected.value) _push(`<button type="button" class="selection-delete-btn" data-v-592947d2${_scopeId}> Удалить </button>`);
							else _push(`<!---->`);
							_push(`<button type="button" class="selection-clear-btn" data-v-592947d2${_scopeId}> Отмена </button></div>`);
						} else _push(`<!---->`);
						if (showPriceModal.value) _push(`<div class="modal-overlay" style="${ssrRenderStyle({ "display": "flex" })}" data-v-592947d2${_scopeId}><div class="price-modal" data-v-592947d2${_scopeId}><div class="price-modal-header" data-v-592947d2${_scopeId}><h3 data-v-592947d2${_scopeId}>Предложить новую цену</h3><button type="button" class="modal-close" data-v-592947d2${_scopeId}><img src="/images/close.svg" alt="Закрыть" data-v-592947d2${_scopeId}></button></div><form data-v-592947d2${_scopeId}><div class="price-modal-body" data-v-592947d2${_scopeId}><label for="new-price" data-v-592947d2${_scopeId}>Новая цена (₽):</label><input id="new-price"${ssrRenderAttr("value", priceForm.value.proposed_price)} type="number" min="0" max="9999999999" placeholder="Введите сумму" required data-v-592947d2${_scopeId}></div><div class="price-modal-footer" data-v-592947d2${_scopeId}><button type="button" class="cancel-btn" data-v-592947d2${_scopeId}>Отмена</button><button type="submit" class="submit-btn" data-v-592947d2${_scopeId}>Предложить</button></div></form></div></div>`);
						else _push(`<!---->`);
						if (priceChangeModal.value.show) _push(`<div class="modal-overlay" style="${ssrRenderStyle({ "display": "flex" })}" data-v-592947d2${_scopeId}><div class="price-modal" data-v-592947d2${_scopeId}><div class="price-modal-header" data-v-592947d2${_scopeId}><h3 data-v-592947d2${_scopeId}>Предложить новую цену</h3><button type="button" class="modal-close" data-v-592947d2${_scopeId}><img src="/images/close.svg" alt="Закрыть" data-v-592947d2${_scopeId}></button></div><form data-v-592947d2${_scopeId}><div class="price-modal-body" data-v-592947d2${_scopeId}><p class="price-modal-info" data-v-592947d2${_scopeId}>Текущее предложение: ${ssrInterpolate(priceChangeModal.value.message?.proposed_price)} ₽</p><label for="new-price-change" data-v-592947d2${_scopeId}>Новая цена (₽):</label><input id="new-price-change"${ssrRenderAttr("value", priceChangeModal.value.newPrice)} type="number" min="0" max="9999999999" placeholder="Введите сумму" required data-v-592947d2${_scopeId}></div><div class="price-modal-footer" data-v-592947d2${_scopeId}><button type="button" class="cancel-btn" data-v-592947d2${_scopeId}>Отмена</button><button type="submit" class="submit-btn" data-v-592947d2${_scopeId}>Предложить</button></div></form></div></div>`);
						else _push(`<!---->`);
						if (openDisputeModal.value) _push(`<div class="modal-overlay" style="${ssrRenderStyle({ "display": "flex" })}" data-v-592947d2${_scopeId}><div class="price-modal" data-v-592947d2${_scopeId}><div class="price-modal-header" data-v-592947d2${_scopeId}><h3 data-v-592947d2${_scopeId}>Открыть спор</h3><button type="button" class="modal-close" data-v-592947d2${_scopeId}><img src="/images/close.svg" alt="Закрыть" data-v-592947d2${_scopeId}></button></div><form data-v-592947d2${_scopeId}><div class="price-modal-body" data-v-592947d2${_scopeId}><label for="dispute-reason" data-v-592947d2${_scopeId}>Причина спора:</label><textarea id="dispute-reason" rows="5" minlength="10" maxlength="5000" placeholder="Опишите причину спора (минимум 10 символов)" required data-v-592947d2${_scopeId}>${ssrInterpolate(disputeForm.value.reason)}</textarea></div><div class="price-modal-footer" data-v-592947d2${_scopeId}><button type="button" class="cancel-btn" data-v-592947d2${_scopeId}>Отмена</button><button type="submit" class="submit-btn" data-v-592947d2${_scopeId}>Отправить</button></div></form></div></div>`);
						else _push(`<!---->`);
					} else return [
						createVNode(unref(Head), { title: "Чаты" }),
						createVNode("div", { class: "chat-container" }, [
							createVNode("div", { class: "chat-list" }, [
								!isSearching.value ? (openBlock(), createBlock("div", {
									key: 0,
									class: "chat-list-header"
								}, [createVNode("h2", null, "Чаты"), createVNode("button", {
									type: "button",
									class: "search-btn",
									onClick: startSearch
								}, [createVNode("img", {
									src: "/images/search.svg",
									alt: "Поиск"
								})])])) : (openBlock(), createBlock("div", {
									key: 1,
									class: "search-header"
								}, [withDirectives(createVNode("input", {
									ref_key: "searchInputRef",
									ref: searchInputRef,
									"onUpdate:modelValue": ($event) => searchQuery.value = $event,
									type: "text",
									placeholder: isGlobalSearch.value ? "Поиск чатов и сообщений..." : "Поиск в чате...",
									class: "search-input",
									onKeydown: withKeys(closeSearch, ["esc"])
								}, null, 40, ["onUpdate:modelValue", "placeholder"]), [[vModelText, searchQuery.value]]), createVNode("button", {
									type: "button",
									class: "search-close",
									onClick: closeSearch
								}, [createVNode("img", {
									src: "/images/close.svg",
									alt: "Закрыть"
								})])])),
								!isSearching.value ? (openBlock(true), createBlock(Fragment, { key: 2 }, renderList(__props.chats, (chat) => {
									return openBlock(), createBlock("div", {
										key: chat.id,
										onClick: ($event) => unref(router).visit(`/chats/${chat.id}`),
										class: ["chat-item", {
											active: __props.activeChat && chat.id === __props.activeChat.id,
											"has-unread": chat.unread_count > 0,
											"accepted-chat": chat.application && chat.application.status === "accepted"
										}],
										tabindex: "0",
										onKeydown: withKeys(($event) => unref(router).visit(`/chats/${chat.id}`), ["enter"])
									}, [chat.other_user ? (openBlock(), createBlock("div", {
										key: 0,
										class: "chat-user-info"
									}, [createVNode("div", { class: "avatar-wrapper" }, [createVNode("img", {
										src: chat.other_user.avatar_url,
										class: "chat-avatar"
									}, null, 8, ["src"]), isUserOnline(chat.other_user.id) ? (openBlock(), createBlock("span", {
										key: 0,
										class: "online-indicator"
									})) : createCommentVNode("", true)]), createVNode("div", null, [createVNode("h3", null, toDisplayString(chat.other_user.name), 1), chat.latest_message ? (openBlock(), createBlock("p", {
										key: 0,
										class: ["chat-preview", { unread: chat.unread_count > 0 }]
									}, toDisplayString(getChatPreview(chat.latest_message)), 3)) : createCommentVNode("", true)])])) : createCommentVNode("", true), createVNode("div", { class: "chat-meta" }, [chat.unread_count > 0 ? (openBlock(), createBlock("span", {
										key: 0,
										class: "unread-badge"
									}, toDisplayString(chat.unread_count > 99 ? "99+" : chat.unread_count), 1)) : createCommentVNode("", true)])], 42, ["onClick", "onKeydown"]);
								}), 128)) : createCommentVNode("", true),
								isSearching.value ? (openBlock(), createBlock("div", {
									key: 3,
									class: "search-results"
								}, [searchResults.value.length === 0 ? (openBlock(), createBlock("div", {
									key: 0,
									class: "search-no-results"
								}, " Ничего не найдено ")) : createCommentVNode("", true), (openBlock(true), createBlock(Fragment, null, renderList(searchResults.value, (result) => {
									return openBlock(), createBlock("div", {
										key: result.id,
										class: "search-result-item",
										onClick: ($event) => goToMessage(result)
									}, [createVNode("img", {
										src: result.user.avatar_url,
										class: "chat-avatar"
									}, null, 8, ["src"]), createVNode("div", { class: "search-result-content" }, [createVNode("div", { class: "search-result-name" }, toDisplayString(result.user.name), 1), result.type === "chat" ? (openBlock(), createBlock("div", {
										key: 0,
										class: "search-result-type"
									}, "Чат")) : (openBlock(), createBlock("div", {
										key: 1,
										class: "search-result-text",
										innerHTML: highlight(result.content)
									}, null, 8, ["innerHTML"]))])], 8, ["onClick"]);
								}), 128))])) : createCommentVNode("", true)
							]),
							createVNode("div", {
								class: ["chat-area", {
									active: !!__props.activeChat,
									sliding: isSliding.value
								}],
								style: slideOffset.value > 0 ? { transform: `translateX(${slideOffset.value}px)` } : {},
								ref_key: "chatArea",
								ref: chatArea,
								onTouchstart: onTouchStart,
								onTouchmove: onTouchMove,
								onTouchend: onTouchEnd
							}, [__props.activeChat ? (openBlock(), createBlock(Fragment, { key: 0 }, [
								createVNode("div", { class: "chat-header" }, [
									createVNode("button", {
										type: "button",
										class: "back",
										onClick: handleBackClick
									}, [createVNode("img", {
										src: "/images/arrow-left.svg",
										alt: "назад"
									})]),
									createVNode("div", { class: "chat-header-mid" }, [
										otherUsers.value.length > 0 ? (openBlock(), createBlock(unref(Link), {
											key: 0,
											href: `/profile/${otherUsers.value[0].id}`,
											class: "chat-header-user"
										}, {
											default: withCtx(() => [createVNode("div", { class: "avatar-wrapper" }, [createVNode("img", {
												src: otherUsers.value[0].avatar_url,
												class: "chat-avatar"
											}, null, 8, ["src"]), isUserOnline(otherUsers.value[0].id) ? (openBlock(), createBlock("span", {
												key: 0,
												class: "online-indicator"
											})) : (openBlock(), createBlock("span", {
												key: 1,
												class: "offline-indicator"
											}))]), createVNode("h2", null, toDisplayString(otherUsers.value[0].name), 1)]),
											_: 1
										}, 8, ["href"])) : createCommentVNode("", true),
										vacancyPostId.value ? (openBlock(), createBlock("span", {
											key: 1,
											class: "vacancy-link"
										}, toDisplayString(isVacancyAuthor.value ? "откликнулся на" : "автор вакансии"), 1)) : createCommentVNode("", true),
										createVNode(unref(Link), { href: `/posts/${vacancyPostId.value}` }, {
											default: withCtx(() => [createVNode("h2", null, toDisplayString(vacancyPosition.value), 1)]),
											_: 1
										}, 8, ["href"])
									]),
									createVNode("img", {
										class: "chat-options",
										src: "/images/dots.svg",
										alt: "опции",
										onClick: withModifiers(toggleOptionsMenu, ["stop"])
									})
								]),
								isSearching.value && !isGlobalSearch.value && __props.activeChat ? (openBlock(), createBlock("div", {
									key: 0,
									class: "search-navigation"
								}, [
									createVNode("button", {
										type: "button",
										class: "search-nav-btn",
										onClick: prevMatch,
										disabled: currentMatchIndex.value <= 0
									}, [createVNode("img", {
										src: "/images/arrow-up.svg",
										alt: "вверх"
									})], 8, ["disabled"]),
									createVNode("span", { class: "search-nav-counter" }, toDisplayString(searchResults.value.length > 0 ? currentMatchIndex.value + 1 : 0) + " / " + toDisplayString(searchResults.value.length), 1),
									createVNode("button", {
										type: "button",
										class: "search-nav-btn",
										onClick: nextMatch,
										disabled: currentMatchIndex.value >= searchResults.value.length - 1
									}, [createVNode("img", {
										src: "/images/arrow-up.svg",
										alt: "вниз",
										style: { "transform": "rotate(180deg)" }
									})], 8, ["disabled"])
								])) : createCommentVNode("", true),
								optionsMenu.value.show ? (openBlock(), createBlock("div", {
									key: 1,
									class: "options-menu",
									style: {
										right: optionsMenu.value.x + "px",
										top: optionsMenu.value.y + 70 + "px"
									}
								}, [
									createVNode("div", {
										class: "options-menu-item",
										onClick: handleChatFiles
									}, "Файлы чата"),
									createVNode("div", {
										class: "options-menu-item",
										onClick: handleAddParticipant
									}, "Добавить участника в чат"),
									createVNode("div", {
										class: "options-menu-item",
										onClick: handleSearchChat
									}, "Поиск по чату"),
									createVNode("div", {
										class: "options-menu-item delete",
										onClick: handleDeleteChat
									}, "Удалить чат")
								], 4)) : createCommentVNode("", true),
								showApplicationBlock.value ? (openBlock(), createBlock("div", {
									key: 2,
									class: ["application-block", { closed: isApplicationBlockClosed.value }]
								}, [createVNode("div", { class: "application-toggle" }, [createVNode("button", {
									type: "button",
									class: "application-toggle-btn",
									onClick: toggleApplicationBlock
								}, [createVNode("img", {
									src: "/images/arrow-up.svg",
									alt: "Toggle",
									class: ["toggle-arrow", { flipped: isApplicationBlockClosed.value }]
								}, null, 2)])]), withDirectives(createVNode("div", { class: "application-card" }, [
									createVNode("img", {
										src: __props.activeChat.application.user.avatar_url,
										class: "application-avatar"
									}, null, 8, ["src"]),
									createVNode("div", { class: "name" }, [createVNode("h3", null, toDisplayString(__props.activeChat.application.user.name), 1), createVNode("span", { class: ["user-status", { online: isUserOnline(otherUsers.value[0].id) }] }, toDisplayString(isUserOnline(otherUsers.value[0].id) ? "онлайн" : "оффлайн"), 3)]),
									createVNode("p", { class: "account-age" }, "Аккаунт создан " + toDisplayString(formatAccountAge(__props.activeChat.application.user.created_at)), 1),
									__props.activeChat.application.user.rating ? (openBlock(), createBlock("div", {
										key: 0,
										class: "application-rating"
									}, [createVNode("span", null, "Рейтинг: " + toDisplayString(__props.activeChat.application.user.rating), 1)])) : createCommentVNode("", true),
									createVNode("div", { class: "application-cover-letter" }, [createVNode("h4", null, "Сопроводительное письмо:"), createVNode("p", null, toDisplayString(__props.activeChat.application.cover_letter), 1)]),
									__props.activeChat.application.proposed_price ? (openBlock(), createBlock("div", {
										key: 1,
										class: "application-price-row"
									}, [createVNode("div", { class: "application-price" }, [createVNode("span", { class: "label" }, "Предложенная цена:"), createVNode("span", { class: "value" }, toDisplayString(__props.activeChat.application.proposed_price) + " ₽", 1)]), isVacancyAuthor.value && __props.activeChat.application.status === "pending" ? (openBlock(), createBlock("button", {
										key: 0,
										type: "button",
										class: "price-edit-btn",
										onClick: ($event) => showPriceModal.value = true
									}, [createVNode("img", {
										src: "/images/edit.svg",
										alt: "Изменить цену"
									})], 8, ["onClick"])) : createCommentVNode("", true)])) : createCommentVNode("", true),
									__props.activeChat.application.completed_at && !__props.activeChat.application.transaction?.completed_at ? (openBlock(), createBlock("div", {
										key: 2,
										class: "application-status"
									}, [createVNode("span", { class: "status-badge waiting" }, "⏳ Ожидание зачисления: " + toDisplayString(getDaysRemaining(__props.activeChat.application.completed_at)) + " дн.", 1)])) : createCommentVNode("", true),
									__props.activeChat.application.dispute && __props.activeChat.application.dispute.status === "open" ? (openBlock(), createBlock("div", {
										key: 3,
										class: "application-status"
									}, [createVNode("span", { class: "status-badge dispute" }, "⚠️ Открыт спор")])) : createCommentVNode("", true),
									isVacancyAuthor.value ? (openBlock(), createBlock("div", {
										key: 4,
										class: "application-actions"
									}, [__props.activeChat.application.status === "pending" ? (openBlock(), createBlock(Fragment, { key: 0 }, [createVNode("form", { onSubmit: withModifiers(acceptApplication, ["prevent"]) }, [createVNode("button", {
										type: "submit",
										class: "accept-btn"
									}, "Принять отклик")], 32), createVNode("form", { onSubmit: withModifiers(rejectApplication, ["prevent"]) }, [createVNode("button", {
										type: "submit",
										class: "reject-btn"
									}, "Отклонить")], 32)], 64)) : __props.activeChat.application.status === "accepted" ? (openBlock(), createBlock(Fragment, { key: 1 }, [
										!__props.activeChat.application.completed_at && !__props.activeChat.application.dispute ? (openBlock(), createBlock("form", {
											key: 0,
											onSubmit: withModifiers(confirmCompletion, ["prevent"])
										}, [createVNode("button", {
											type: "submit",
											class: "accept-btn"
										}, "Подтвердить завершение")], 32)) : createCommentVNode("", true),
										createVNode("form", { onSubmit: withModifiers(withdrawApplication, ["prevent"]) }, [createVNode("button", {
											type: "submit",
											class: "withdraw-btn"
										}, "Отменить")], 32),
										createVNode("form", { onSubmit: withModifiers(closeVacancy, ["prevent"]) }, [createVNode("button", {
											type: "submit",
											class: "close-btn"
										}, "Закрыть вакансию")], 32)
									], 64)) : createCommentVNode("", true)])) : createCommentVNode("", true),
									!isVacancyAuthor.value && __props.activeChat.application.status === "accepted" && !__props.activeChat.application.dispute ? (openBlock(), createBlock("div", {
										key: 5,
										class: "application-actions"
									}, [createVNode("button", {
										type: "button",
										class: "dispute-btn",
										onClick: ($event) => openDisputeModal.value = true
									}, " Открыть спор ", 8, ["onClick"])])) : createCommentVNode("", true)
								], 512), [[vShow, !isApplicationBlockClosed.value]])], 2)) : createCommentVNode("", true),
								createVNode("div", {
									class: "chat-messages",
									ref_key: "messagesRef",
									ref: messagesRef
								}, [createVNode("div", { class: "chat-messages-inner" }, [createVNode(TransitionGroup, {
									name: "messages",
									tag: "div",
									class: "chat-messages-content"
								}, {
									default: withCtx(() => [(openBlock(true), createBlock(Fragment, null, renderList(localMessages.value, (message, index) => {
										return openBlock(), createBlock("div", {
											key: message._clientId || message.id,
											"data-message-id": message.id,
											class: ["message-container", {
												"right-clicked": rightClickedMessage.value && rightClickedMessage.value.id === message.id,
												"selected": selectedMessages.value.some((m) => m.id === message.id),
												"search-highlighted": isSearching.value && searchResults.value[currentMatchIndex.value]?.id === message.id
											}],
											onClick: ($event) => toggleMessageSelection(message, $event),
											onContextmenu: withModifiers(($event) => showContextMenu($event, message), ["prevent"])
										}, [createVNode("img", {
											src: message.user.avatar_url,
											class: "chat-avatar"
										}, null, 8, ["src"]), createVNode("div", { class: ["message", {
											"my-message": message.is_mine,
											"shared-post": isOnlyPostUrl(message.content)
										}] }, [
											message.image_url ? (openBlock(), createBlock("img", {
												key: 0,
												src: message.image_url,
												alt: "Изображение",
												class: "message-image",
												onClick: ($event) => openImage(message.image_url)
											}, null, 8, ["src", "onClick"])) : createCommentVNode("", true),
											message.video_url ? (openBlock(), createBlock("video", {
												key: 1,
												src: message.video_url,
												class: "message-video",
												controls: "",
												onClick: withModifiers(($event) => openVideo(message.video_url), ["stop"])
											}, null, 8, ["src", "onClick"])) : createCommentVNode("", true),
											createVNode("div", {
												class: "message-content",
												onClick: handleMessageContentClick
											}, [
												message.content && !isOnlyPostUrl(message.content) ? (openBlock(), createBlock("span", {
													key: 0,
													innerHTML: renderContent(message.content)
												}, null, 8, ["innerHTML"])) : createCommentVNode("", true),
												(openBlock(true), createBlock(Fragment, null, renderList(getPostPreviewsFromContent(message.content), (preview) => {
													return openBlock(), createBlock("div", {
														key: preview.id,
														class: ["post-preview-card", { "shared-post-card": isOnlyPostUrl(message.content) }],
														onClick: withModifiers(($event) => unref(router).visit(`/posts/${preview.id}`), ["stop"])
													}, [preview.image_url ? (openBlock(), createBlock("img", {
														key: 0,
														src: preview.image_url,
														class: "post-preview-img",
														alt: ""
													}, null, 8, ["src"])) : createCommentVNode("", true), createVNode("div", { class: "post-preview-body" }, [createVNode("div", { class: "post-preview-title" }, toDisplayString(preview.title), 1), preview.description ? (openBlock(), createBlock("div", {
														key: 0,
														class: "post-preview-desc"
													}, toDisplayString(preview.description.slice(0, 80)) + toDisplayString(preview.description.length > 80 ? "…" : ""), 1)) : createCommentVNode("", true)])], 10, ["onClick"]);
												}), 128)),
												message.file_url ? (openBlock(), createBlock("div", {
													key: 1,
													class: "file-attachment"
												}, [createVNode("button", {
													type: "button",
													class: "file-download-circle",
													title: isFileDownloaded(message) ? "Скачано" : "Скачать",
													onClick: ($event) => downloadFile(message)
												}, [!isFileDownloaded(message) ? (openBlock(), createBlock("span", { key: 0 }, [createVNode("img", {
													src: "/images/download.svg",
													alt: "Скачать"
												})])) : (openBlock(), createBlock("span", { key: 1 }, [createVNode("img", {
													src: "/images/document.svg",
													alt: "Файл"
												})]))], 8, ["title", "onClick"]), createVNode("div", { class: "file-meta" }, [createVNode("div", { class: "file-name" }, toDisplayString(message.file_name || "Файл"), 1), message.file_size ? (openBlock(), createBlock("div", {
													key: 0,
													class: "file-size"
												}, toDisplayString(formatSize(message.file_size)), 1)) : createCommentVNode("", true)])])) : createCommentVNode("", true),
												message.is_price_proposal && message.price_proposal_status === "pending" && !message.is_mine ? (openBlock(), createBlock("div", {
													key: 2,
													class: "price-proposal-actions"
												}, [createVNode("form", {
													onSubmit: withModifiers(($event) => acceptPriceProposal(message), ["prevent"]),
													class: "price-action-form"
												}, [createVNode("button", {
													type: "submit",
													class: "accept-price-btn",
													onClick: withModifiers(() => {}, ["stop"])
												}, "Принять", 8, ["onClick"])], 40, ["onSubmit"]), createVNode("button", {
													type: "button",
													class: "change-price-btn",
													onClick: withModifiers(($event) => openPriceChangeModal(message), ["stop"])
												}, "Изменить", 8, ["onClick"])])) : createCommentVNode("", true)
											]),
											createVNode("div", { class: "message-time" }, [createVNode("span", null, toDisplayString(message.time), 1), getMessageStatus(message) ? (openBlock(), createBlock("span", {
												key: 0,
												class: ["message-status", getMessageStatus(message)]
											}, [getMessageStatus(message) === "sending" ? (openBlock(), createBlock("img", {
												key: 0,
												src: "/images/loading.svg",
												alt: "Отправляется",
												class: "status-icon spinning"
											})) : getMessageStatus(message) === "sent" ? (openBlock(), createBlock("img", {
												key: 1,
												src: "/images/check-mark.svg",
												alt: "Отправлено",
												class: "status-icon"
											})) : getMessageStatus(message) === "read" ? (openBlock(), createBlock("img", {
												key: 2,
												src: "/images/double-check.svg",
												alt: "Прочитано",
												class: "status-icon",
												style: {
													"width": "16px",
													"height": "16px"
												}
											})) : getMessageStatus(message) === "failed" ? (openBlock(), createBlock("img", {
												key: 3,
												src: "/images/exclamation-circle.svg",
												alt: "Не отправлено",
												class: "status-icon"
											})) : createCommentVNode("", true)], 2)) : createCommentVNode("", true)])
										], 2)], 42, [
											"data-message-id",
											"onClick",
											"onContextmenu"
										]);
									}), 128))]),
									_: 1
								}), showSkeleton.value ? (openBlock(), createBlock("div", {
									key: 0,
									class: ["chat-skeleton", { fading: isSkeletonFading.value }]
								}, [(openBlock(true), createBlock(Fragment, null, renderList(skeletonItems.value, (item, index) => {
									return openBlock(), createBlock("div", {
										key: index,
										class: ["skeleton-message", { right: item.side === "right" }]
									}, [createVNode("div", { class: "skeleton-avatar" }), createVNode("div", { class: "skeleton-bubble" }, [
										createVNode("div", {
											class: "skeleton-line",
											style: { width: item.lines[0] }
										}, null, 4),
										createVNode("div", {
											class: "skeleton-line short",
											style: { width: item.lines[1] }
										}, null, 4),
										item.hasThirdLine ? (openBlock(), createBlock("div", {
											key: 0,
											class: "skeleton-line tiny",
											style: { width: item.lines[2] }
										}, null, 4)) : createCommentVNode("", true)
									])], 2);
								}), 128))], 2)) : createCommentVNode("", true)])], 512),
								createVNode("form", {
									class: "message-form",
									onSubmit: withModifiers(sendMessage, ["prevent"]),
									enctype: "multipart/form-data"
								}, [
									editingMessage.value ? (openBlock(), createBlock("div", {
										key: 0,
										class: "editing-indicator"
									}, [createVNode("span", null, "Редактирование сообщения"), createVNode("button", {
										type: "button",
										class: "cancel-edit-btn",
										onClick: cancelEdit
									}, "✕")])) : createCommentVNode("", true),
									createVNode("div", { class: "message-input-container" }, [
										!editingMessage.value ? (openBlock(), createBlock("div", {
											key: 0,
											class: "add"
										}, [createVNode("img", {
											src: "/images/clip.svg",
											alt: "Добавить вложение"
										}), createVNode("div", { class: "add-select" }, [
											createVNode("label", null, [createTextVNode(" Фото "), createVNode("input", {
												type: "file",
												name: "photo",
												accept: "image/*",
												onChange: _ctx.onPhotoChange
											}, null, 40, ["onChange"])]),
											createVNode("label", null, [createTextVNode(" Видео "), createVNode("input", {
												type: "file",
												name: "video",
												accept: "video/*",
												onChange: _ctx.onVideoChange
											}, null, 40, ["onChange"])]),
											createVNode("label", null, [createTextVNode(" Документ "), createVNode("input", {
												type: "file",
												name: "document",
												onChange: _ctx.onDocumentChange
											}, null, 40, ["onChange"])])
										])])) : createCommentVNode("", true),
										withDirectives(createVNode("textarea", {
											ref_key: "textareaRef",
											ref: textareaRef,
											"onUpdate:modelValue": ($event) => unref(form).content = $event,
											placeholder: editingMessage.value ? "Редактируйте сообщение..." : "Введите сообщение...",
											onInput: autoResize,
											onKeydown: withKeys(withModifiers(sendMessage, ["exact", "prevent"]), ["enter"])
										}, null, 40, [
											"onUpdate:modelValue",
											"placeholder",
											"onKeydown"
										]), [[vModelText, unref(form).content]]),
										createVNode("button", {
											type: "submit",
											disabled: unref(form).processing || !canSend.value
										}, toDisplayString(editingMessage.value ? "Сохранить" : "Отправить"), 9, ["disabled"])
									]),
									photoPreviewUrl.value || videoPreviewUrl.value || documentPreviewName.value ? (openBlock(), createBlock("div", {
										key: 1,
										class: "image-preview-container",
										style: { "display": "flex" }
									}, [
										photoPreviewUrl.value ? (openBlock(), createBlock("img", {
											key: 0,
											src: photoPreviewUrl.value,
											alt: "Превью",
											class: "image-preview"
										}, null, 8, ["src"])) : createCommentVNode("", true),
										videoPreviewUrl.value ? (openBlock(), createBlock("video", {
											key: 1,
											src: videoPreviewUrl.value,
											class: "video-preview",
											controls: ""
										}, null, 8, ["src"])) : createCommentVNode("", true),
										documentPreviewName.value ? (openBlock(), createBlock("div", {
											key: 2,
											class: "file-preview"
										}, " 📎 " + toDisplayString(documentPreviewName.value), 1)) : createCommentVNode("", true),
										createVNode("div", { class: "preview-actions" }, [createVNode("button", {
											type: "button",
											class: "select-other-btn",
											onClick: selectOtherFile
										}, " Выбрать другое "), !editingMessage.value ? (openBlock(), createBlock("button", {
											key: 0,
											type: "button",
											class: "cancel-preview-btn",
											onClick: cancelPreview
										}, " Отмена ")) : createCommentVNode("", true)])
									])) : createCommentVNode("", true)
								], 32)
							], 64)) : (openBlock(), createBlock("div", {
								key: 1,
								class: "chat-placeholder"
							}, [createVNode("p", null, "Выберите чат для начала общения")]))], 38),
							showChatFiles.value ? (openBlock(), createBlock("div", {
								key: 0,
								class: "chat-files-panel"
							}, [
								createVNode("div", { class: "chat-files-header" }, [createVNode("h3", null, "Файлы чата"), createVNode("button", {
									type: "button",
									class: "chat-files-close",
									onClick: closeChatFiles
								}, [createVNode("img", {
									src: "/images/close.svg",
									alt: "Закрыть"
								})])]),
								createVNode("div", { class: "chat-files-tabs" }, [
									createVNode("button", {
										type: "button",
										class: ["chat-files-tab", { active: chatFilesTab.value === "media" }],
										onClick: ($event) => chatFilesTab.value = "media"
									}, " Медиа ", 10, ["onClick"]),
									createVNode("button", {
										type: "button",
										class: ["chat-files-tab", { active: chatFilesTab.value === "files" }],
										onClick: ($event) => chatFilesTab.value = "files"
									}, " Файлы ", 10, ["onClick"]),
									createVNode("button", {
										type: "button",
										class: ["chat-files-tab", { active: chatFilesTab.value === "links" }],
										onClick: ($event) => chatFilesTab.value = "links"
									}, " Ссылки ", 10, ["onClick"])
								]),
								createVNode("div", { class: "chat-files-content" }, [
									chatFilesTab.value === "media" ? (openBlock(), createBlock("div", {
										key: 0,
										class: "chat-files-media"
									}, [chatMediaFiles.value.length === 0 ? (openBlock(), createBlock("div", {
										key: 0,
										class: "chat-files-empty"
									}, " Нет медиафайлов ")) : (openBlock(), createBlock("div", {
										key: 1,
										class: "chat-files-grid"
									}, [(openBlock(true), createBlock(Fragment, null, renderList(chatMediaFiles.value, (media) => {
										return openBlock(), createBlock("div", {
											key: media.id,
											class: "chat-files-media-item",
											onClick: ($event) => media.type === "video" ? openVideo(media.url) : openImage(media.url)
										}, [media.type === "image" ? (openBlock(), createBlock("img", {
											key: 0,
											src: media.url,
											alt: "Медиа"
										}, null, 8, ["src"])) : (openBlock(), createBlock("video", {
											key: 1,
											src: media.url
										}, null, 8, ["src"])), media.type === "video" ? (openBlock(), createBlock("div", {
											key: 2,
											class: "play-icon"
										}, "▶")) : createCommentVNode("", true)], 8, ["onClick"]);
									}), 128))]))])) : createCommentVNode("", true),
									chatFilesTab.value === "files" ? (openBlock(), createBlock("div", {
										key: 1,
										class: "chat-files-list"
									}, [chatDocFiles.value.length === 0 ? (openBlock(), createBlock("div", {
										key: 0,
										class: "chat-files-empty"
									}, " Нет файлов ")) : (openBlock(), createBlock("div", { key: 1 }, [(openBlock(true), createBlock(Fragment, null, renderList(chatDocFiles.value, (file) => {
										return openBlock(), createBlock("div", {
											key: file.id,
											class: "chat-files-item"
										}, [createVNode("button", {
											type: "button",
											class: "file-download-circle",
											onClick: ($event) => downloadFile(file)
										}, [createVNode("img", {
											src: "/images/download.svg",
											alt: "Скачать"
										})], 8, ["onClick"]), createVNode("div", { class: "file-info" }, [createVNode("div", { class: "file-name" }, toDisplayString(file.file_name), 1), createVNode("div", { class: "file-size" }, toDisplayString(formatSize(file.file_size)), 1)])]);
									}), 128))]))])) : createCommentVNode("", true),
									chatFilesTab.value === "links" ? (openBlock(), createBlock("div", {
										key: 2,
										class: "chat-files-list"
									}, [chatLinks.value.length === 0 ? (openBlock(), createBlock("div", {
										key: 0,
										class: "chat-files-empty"
									}, " Нет ссылок ")) : (openBlock(), createBlock("div", { key: 1 }, [(openBlock(true), createBlock(Fragment, null, renderList(chatLinks.value, (link) => {
										return openBlock(), createBlock("div", {
											key: link.id,
											class: "chat-files-link",
											onClick: ($event) => handleLinkClick(link.url)
										}, [createVNode("span", { class: "link-text" }, toDisplayString(link.content), 1), createVNode("span", { class: "link-time" }, toDisplayString(link.time), 1)], 8, ["onClick"]);
									}), 128))]))])) : createCommentVNode("", true)
								])
							])) : createCommentVNode("", true)
						]),
						modalOpen.value && modalImage.value ? (openBlock(), createBlock("div", {
							key: 0,
							class: "modal-overlay",
							onClick: withModifiers(closeModal, ["self"]),
							style: { "display": "flex" }
						}, [createVNode("div", { class: "modal-content" }, [createVNode("button", {
							class: "modal-close",
							type: "button",
							onClick: closeModal
						}, " × "), createVNode("img", {
							src: modalImage.value,
							alt: "Предпросмотр"
						}, null, 8, ["src"])])])) : createCommentVNode("", true),
						modalOpen.value && modalVideo.value ? (openBlock(), createBlock("div", {
							key: 1,
							class: "modal-overlay",
							onClick: withModifiers(closeModal, ["self"]),
							style: { "display": "flex" }
						}, [createVNode("div", { class: "modal-content modal-video-content" }, [createVNode("button", {
							class: "modal-close",
							type: "button",
							onClick: closeModal
						}, " × "), createVNode("video", {
							src: modalVideo.value,
							controls: "",
							autoplay: "",
							class: "modal-video"
						}, null, 8, ["src"])])])) : createCommentVNode("", true),
						contextMenu.value.show ? (openBlock(), createBlock("div", {
							key: 2,
							class: "context-menu",
							style: {
								left: contextMenu.value.x + "px",
								top: contextMenu.value.y + "px"
							}
						}, [
							!contextMenu.value.message?.is_mine ? (openBlock(), createBlock("div", {
								key: 0,
								class: "context-menu-item",
								onClick: ($event) => replyToMessage(contextMenu.value.message)
							}, " Ответить ", 8, ["onClick"])) : createCommentVNode("", true),
							contextMenu.value.message?.is_mine ? (openBlock(), createBlock("div", {
								key: 1,
								class: "context-menu-item",
								onClick: ($event) => editMessage(contextMenu.value.message)
							}, " Редактировать ", 8, ["onClick"])) : createCommentVNode("", true),
							contextMenu.value.message?.is_mine ? (openBlock(), createBlock("div", {
								key: 2,
								class: "context-menu-item delete",
								onClick: ($event) => deleteMessage(contextMenu.value.message)
							}, " Удалить ", 8, ["onClick"])) : createCommentVNode("", true)
						], 4)) : createCommentVNode("", true),
						selectedMessages.value.length > 0 ? (openBlock(), createBlock("div", {
							key: 3,
							class: "selection-toolbar"
						}, [
							createVNode("span", null, toDisplayString(selectedMessages.value.length) + " выбрано", 1),
							canDeleteSelected.value ? (openBlock(), createBlock("button", {
								key: 0,
								type: "button",
								class: "selection-delete-btn",
								onClick: deleteSelectedMessages
							}, " Удалить ")) : createCommentVNode("", true),
							createVNode("button", {
								type: "button",
								class: "selection-clear-btn",
								onClick: clearSelection
							}, " Отмена ")
						])) : createCommentVNode("", true),
						showPriceModal.value ? (openBlock(), createBlock("div", {
							key: 4,
							class: "modal-overlay",
							style: { "display": "flex" },
							onClick: withModifiers(($event) => showPriceModal.value = false, ["self"])
						}, [createVNode("div", { class: "price-modal" }, [createVNode("div", { class: "price-modal-header" }, [createVNode("h3", null, "Предложить новую цену"), createVNode("button", {
							type: "button",
							class: "modal-close",
							onClick: ($event) => showPriceModal.value = false
						}, [createVNode("img", {
							src: "/images/close.svg",
							alt: "Закрыть"
						})], 8, ["onClick"])]), createVNode("form", { onSubmit: withModifiers(submitPriceProposal, ["prevent"]) }, [createVNode("div", { class: "price-modal-body" }, [createVNode("label", { for: "new-price" }, "Новая цена (₽):"), withDirectives(createVNode("input", {
							id: "new-price",
							"onUpdate:modelValue": ($event) => priceForm.value.proposed_price = $event,
							type: "number",
							min: "0",
							max: "9999999999",
							placeholder: "Введите сумму",
							required: ""
						}, null, 8, ["onUpdate:modelValue"]), [[vModelText, priceForm.value.proposed_price]])]), createVNode("div", { class: "price-modal-footer" }, [createVNode("button", {
							type: "button",
							class: "cancel-btn",
							onClick: ($event) => showPriceModal.value = false
						}, "Отмена", 8, ["onClick"]), createVNode("button", {
							type: "submit",
							class: "submit-btn"
						}, "Предложить")])], 32)])], 8, ["onClick"])) : createCommentVNode("", true),
						priceChangeModal.value.show ? (openBlock(), createBlock("div", {
							key: 5,
							class: "modal-overlay",
							style: { "display": "flex" },
							onClick: withModifiers(($event) => priceChangeModal.value.show = false, ["self"])
						}, [createVNode("div", { class: "price-modal" }, [createVNode("div", { class: "price-modal-header" }, [createVNode("h3", null, "Предложить новую цену"), createVNode("button", {
							type: "button",
							class: "modal-close",
							onClick: ($event) => priceChangeModal.value.show = false
						}, [createVNode("img", {
							src: "/images/close.svg",
							alt: "Закрыть"
						})], 8, ["onClick"])]), createVNode("form", { onSubmit: withModifiers(submitPriceChange, ["prevent"]) }, [createVNode("div", { class: "price-modal-body" }, [
							createVNode("p", { class: "price-modal-info" }, "Текущее предложение: " + toDisplayString(priceChangeModal.value.message?.proposed_price) + " ₽", 1),
							createVNode("label", { for: "new-price-change" }, "Новая цена (₽):"),
							withDirectives(createVNode("input", {
								id: "new-price-change",
								"onUpdate:modelValue": ($event) => priceChangeModal.value.newPrice = $event,
								type: "number",
								min: "0",
								max: "9999999999",
								placeholder: "Введите сумму",
								required: ""
							}, null, 8, ["onUpdate:modelValue"]), [[vModelText, priceChangeModal.value.newPrice]])
						]), createVNode("div", { class: "price-modal-footer" }, [createVNode("button", {
							type: "button",
							class: "cancel-btn",
							onClick: ($event) => priceChangeModal.value.show = false
						}, "Отмена", 8, ["onClick"]), createVNode("button", {
							type: "submit",
							class: "submit-btn"
						}, "Предложить")])], 32)])], 8, ["onClick"])) : createCommentVNode("", true),
						openDisputeModal.value ? (openBlock(), createBlock("div", {
							key: 6,
							class: "modal-overlay",
							style: { "display": "flex" },
							onClick: withModifiers(($event) => openDisputeModal.value = false, ["self"])
						}, [createVNode("div", { class: "price-modal" }, [createVNode("div", { class: "price-modal-header" }, [createVNode("h3", null, "Открыть спор"), createVNode("button", {
							type: "button",
							class: "modal-close",
							onClick: ($event) => openDisputeModal.value = false
						}, [createVNode("img", {
							src: "/images/close.svg",
							alt: "Закрыть"
						})], 8, ["onClick"])]), createVNode("form", { onSubmit: withModifiers(submitDispute, ["prevent"]) }, [createVNode("div", { class: "price-modal-body" }, [createVNode("label", { for: "dispute-reason" }, "Причина спора:"), withDirectives(createVNode("textarea", {
							id: "dispute-reason",
							"onUpdate:modelValue": ($event) => disputeForm.value.reason = $event,
							rows: "5",
							minlength: "10",
							maxlength: "5000",
							placeholder: "Опишите причину спора (минимум 10 символов)",
							required: ""
						}, null, 8, ["onUpdate:modelValue"]), [[vModelText, disputeForm.value.reason]])]), createVNode("div", { class: "price-modal-footer" }, [createVNode("button", {
							type: "button",
							class: "cancel-btn",
							onClick: ($event) => openDisputeModal.value = false
						}, "Отмена", 8, ["onClick"]), createVNode("button", {
							type: "submit",
							class: "submit-btn"
						}, "Отправить")])], 32)])], 8, ["onClick"])) : createCommentVNode("", true)
					];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup$14 = _sfc_main$14.setup;
_sfc_main$14.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Chat/Chats.vue");
	return _sfc_setup$14 ? _sfc_setup$14(props, ctx) : void 0;
};
var Chats_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$14, [["__scopeId", "data-v-592947d2"]]);
//#endregion
//#region resources/js/Pages/Disputes/Index.vue
var Index_exports$1 = /* @__PURE__ */ __exportAll({ default: () => Index_default$1 });
var _sfc_main$13 = {
	__name: "Index",
	__ssrInlineRender: true,
	props: { disputes: {
		type: Object,
		default: () => ({
			data: [],
			current_page: 1,
			last_page: 1
		})
	} },
	setup(__props) {
		useDarkMode();
		const processing = ref(null);
		const resolveModal = ref({
			show: false,
			disputeId: null,
			resolution: ""
		});
		const getStatusLabel = (status) => {
			return {
				"open": "Открыт",
				"resolved": "Решён",
				"cancelled": "Отменён"
			}[status] || status;
		};
		const formatDate = (dateString) => {
			return new Date(dateString).toLocaleDateString("ru-RU", {
				day: "numeric",
				month: "long",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit"
			});
		};
		const takeDispute = (disputeId) => {
			processing.value = disputeId;
			router.post(`/admin/disputes/${disputeId}/take`, {}, {
				preserveScroll: true,
				onFinish: () => {
					processing.value = null;
				}
			});
		};
		const showResolveModal = (dispute) => {
			resolveModal.value = {
				show: true,
				disputeId: dispute.id,
				resolution: ""
			};
		};
		const closeResolveModal = () => {
			resolveModal.value = {
				show: false,
				disputeId: null,
				resolution: ""
			};
		};
		const submitResolution = () => {
			if (resolveModal.value.resolution.length < 10) return;
			router.post(`/admin/disputes/${resolveModal.value.disputeId}/resolve`, { resolution: resolveModal.value.resolution }, {
				preserveScroll: true,
				onSuccess: () => {
					closeResolveModal();
				}
			});
		};
		const viewChat = (chatId) => {
			if (chatId) router.visit(`/chats/${chatId}`);
		};
		const goToPage = (page) => {
			router.visit(`/admin/disputes?page=${page}`);
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(AppLayout_default, _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(unref(Head), { title: "Управление спорами" }, null, _parent, _scopeId));
						_push(`<div class="disputes-page" data-v-2a942cd1${_scopeId}><div class="page-header" data-v-2a942cd1${_scopeId}><h1 data-v-2a942cd1${_scopeId}>Управление спорами</h1></div>`);
						if (__props.disputes && __props.disputes.data && __props.disputes.data.length > 0) {
							_push(`<div class="disputes-list" data-v-2a942cd1${_scopeId}><!--[-->`);
							ssrRenderList(__props.disputes.data, (dispute) => {
								_push(`<div class="dispute-card" data-v-2a942cd1${_scopeId}><div class="dispute-header" data-v-2a942cd1${_scopeId}><div class="${ssrRenderClass([dispute.status, "dispute-status"])}" data-v-2a942cd1${_scopeId}>${ssrInterpolate(getStatusLabel(dispute.status))}</div><div class="dispute-date" data-v-2a942cd1${_scopeId}>${ssrInterpolate(formatDate(dispute.created_at))}</div></div><div class="dispute-body" data-v-2a942cd1${_scopeId}><div class="dispute-initiator" data-v-2a942cd1${_scopeId}><strong data-v-2a942cd1${_scopeId}>Инициатор:</strong> ${ssrInterpolate(dispute.initiator?.name || "Неизвестно")}</div>`);
								if (dispute.application) _push(`<div class="dispute-application" data-v-2a942cd1${_scopeId}><strong data-v-2a942cd1${_scopeId}>Вакансия:</strong> ${ssrInterpolate(dispute.application.vacancy?.position || "Неизвестно")}</div>`);
								else _push(`<!---->`);
								_push(`<div class="dispute-reason" data-v-2a942cd1${_scopeId}><strong data-v-2a942cd1${_scopeId}>Причина:</strong><p data-v-2a942cd1${_scopeId}>${ssrInterpolate(dispute.reason)}</p></div>`);
								if (dispute.admin) _push(`<div class="dispute-admin" data-v-2a942cd1${_scopeId}><strong data-v-2a942cd1${_scopeId}>Администратор:</strong> ${ssrInterpolate(dispute.admin.name)}</div>`);
								else _push(`<!---->`);
								if (dispute.resolution) _push(`<div class="dispute-resolution" data-v-2a942cd1${_scopeId}><strong data-v-2a942cd1${_scopeId}>Решение:</strong><p data-v-2a942cd1${_scopeId}>${ssrInterpolate(dispute.resolution)}</p></div>`);
								else _push(`<!---->`);
								_push(`</div><div class="dispute-actions" data-v-2a942cd1${_scopeId}>`);
								if (dispute.status === "open") {
									_push(`<!--[-->`);
									if (!dispute.admin_id) _push(`<button class="btn-take"${ssrIncludeBooleanAttr(processing.value === dispute.id) ? " disabled" : ""} data-v-2a942cd1${_scopeId}>${ssrInterpolate(processing.value === dispute.id ? "Принимаем..." : "Взять в работу")}</button>`);
									else _push(`<button class="btn-resolve" data-v-2a942cd1${_scopeId}> Вынести решение </button>`);
									_push(`<!--]-->`);
								} else _push(`<!---->`);
								_push(`<button class="btn-chat" data-v-2a942cd1${_scopeId}> Перейти в чат </button></div></div>`);
							});
							_push(`<!--]--></div>`);
						} else _push(`<div class="no-disputes" data-v-2a942cd1${_scopeId}><p data-v-2a942cd1${_scopeId}>Нет открытых споров</p></div>`);
						if (__props.disputes && __props.disputes.last_page > 1) {
							_push(`<div class="pagination" data-v-2a942cd1${_scopeId}>`);
							if (__props.disputes.current_page > 1) _push(`<button class="pagination-btn" data-v-2a942cd1${_scopeId}> ← Назад </button>`);
							else _push(`<!---->`);
							_push(`<span class="pagination-info" data-v-2a942cd1${_scopeId}> Страница ${ssrInterpolate(__props.disputes.current_page)} из ${ssrInterpolate(__props.disputes.last_page)}</span>`);
							if (__props.disputes.current_page < __props.disputes.last_page) _push(`<button class="pagination-btn" data-v-2a942cd1${_scopeId}> Вперёд → </button>`);
							else _push(`<!---->`);
							_push(`</div>`);
						} else _push(`<!---->`);
						if (resolveModal.value.show) _push(`<div class="modal-overlay" data-v-2a942cd1${_scopeId}><div class="resolve-modal" data-v-2a942cd1${_scopeId}><div class="modal-header" data-v-2a942cd1${_scopeId}><h3 data-v-2a942cd1${_scopeId}>Вынести решение по спору</h3><button class="modal-close" data-v-2a942cd1${_scopeId}>×</button></div><form data-v-2a942cd1${_scopeId}><div class="modal-body" data-v-2a942cd1${_scopeId}><label for="resolution" data-v-2a942cd1${_scopeId}>Решение:</label><textarea id="resolution" rows="5" minlength="10" required placeholder="Опишите ваше решение (минимум 10 символов)" data-v-2a942cd1${_scopeId}>${ssrInterpolate(resolveModal.value.resolution)}</textarea></div><div class="modal-footer" data-v-2a942cd1${_scopeId}><button type="button" class="btn-cancel" data-v-2a942cd1${_scopeId}>Отмена</button><button type="submit" class="btn-submit" data-v-2a942cd1${_scopeId}>Отправить решение</button></div></form></div></div>`);
						else _push(`<!---->`);
						_push(`</div>`);
					} else return [createVNode(unref(Head), { title: "Управление спорами" }), createVNode("div", { class: "disputes-page" }, [
						createVNode("div", { class: "page-header" }, [createVNode("h1", null, "Управление спорами")]),
						__props.disputes && __props.disputes.data && __props.disputes.data.length > 0 ? (openBlock(), createBlock("div", {
							key: 0,
							class: "disputes-list"
						}, [(openBlock(true), createBlock(Fragment, null, renderList(__props.disputes.data, (dispute) => {
							return openBlock(), createBlock("div", {
								key: dispute.id,
								class: "dispute-card"
							}, [
								createVNode("div", { class: "dispute-header" }, [createVNode("div", { class: ["dispute-status", dispute.status] }, toDisplayString(getStatusLabel(dispute.status)), 3), createVNode("div", { class: "dispute-date" }, toDisplayString(formatDate(dispute.created_at)), 1)]),
								createVNode("div", { class: "dispute-body" }, [
									createVNode("div", { class: "dispute-initiator" }, [createVNode("strong", null, "Инициатор:"), createTextVNode(" " + toDisplayString(dispute.initiator?.name || "Неизвестно"), 1)]),
									dispute.application ? (openBlock(), createBlock("div", {
										key: 0,
										class: "dispute-application"
									}, [createVNode("strong", null, "Вакансия:"), createTextVNode(" " + toDisplayString(dispute.application.vacancy?.position || "Неизвестно"), 1)])) : createCommentVNode("", true),
									createVNode("div", { class: "dispute-reason" }, [createVNode("strong", null, "Причина:"), createVNode("p", null, toDisplayString(dispute.reason), 1)]),
									dispute.admin ? (openBlock(), createBlock("div", {
										key: 1,
										class: "dispute-admin"
									}, [createVNode("strong", null, "Администратор:"), createTextVNode(" " + toDisplayString(dispute.admin.name), 1)])) : createCommentVNode("", true),
									dispute.resolution ? (openBlock(), createBlock("div", {
										key: 2,
										class: "dispute-resolution"
									}, [createVNode("strong", null, "Решение:"), createVNode("p", null, toDisplayString(dispute.resolution), 1)])) : createCommentVNode("", true)
								]),
								createVNode("div", { class: "dispute-actions" }, [dispute.status === "open" ? (openBlock(), createBlock(Fragment, { key: 0 }, [!dispute.admin_id ? (openBlock(), createBlock("button", {
									key: 0,
									onClick: ($event) => takeDispute(dispute.id),
									class: "btn-take",
									disabled: processing.value === dispute.id
								}, toDisplayString(processing.value === dispute.id ? "Принимаем..." : "Взять в работу"), 9, ["onClick", "disabled"])) : (openBlock(), createBlock("button", {
									key: 1,
									onClick: ($event) => showResolveModal(dispute),
									class: "btn-resolve"
								}, " Вынести решение ", 8, ["onClick"]))], 64)) : createCommentVNode("", true), createVNode("button", {
									onClick: ($event) => viewChat(dispute.chat_id),
									class: "btn-chat"
								}, " Перейти в чат ", 8, ["onClick"])])
							]);
						}), 128))])) : (openBlock(), createBlock("div", {
							key: 1,
							class: "no-disputes"
						}, [createVNode("p", null, "Нет открытых споров")])),
						__props.disputes && __props.disputes.last_page > 1 ? (openBlock(), createBlock("div", {
							key: 2,
							class: "pagination"
						}, [
							__props.disputes.current_page > 1 ? (openBlock(), createBlock("button", {
								key: 0,
								onClick: ($event) => goToPage(__props.disputes.current_page - 1),
								class: "pagination-btn"
							}, " ← Назад ", 8, ["onClick"])) : createCommentVNode("", true),
							createVNode("span", { class: "pagination-info" }, " Страница " + toDisplayString(__props.disputes.current_page) + " из " + toDisplayString(__props.disputes.last_page), 1),
							__props.disputes.current_page < __props.disputes.last_page ? (openBlock(), createBlock("button", {
								key: 1,
								onClick: ($event) => goToPage(__props.disputes.current_page + 1),
								class: "pagination-btn"
							}, " Вперёд → ", 8, ["onClick"])) : createCommentVNode("", true)
						])) : createCommentVNode("", true),
						resolveModal.value.show ? (openBlock(), createBlock("div", {
							key: 3,
							class: "modal-overlay",
							onClick: withModifiers(closeResolveModal, ["self"])
						}, [createVNode("div", { class: "resolve-modal" }, [createVNode("div", { class: "modal-header" }, [createVNode("h3", null, "Вынести решение по спору"), createVNode("button", {
							onClick: closeResolveModal,
							class: "modal-close"
						}, "×")]), createVNode("form", { onSubmit: withModifiers(submitResolution, ["prevent"]) }, [createVNode("div", { class: "modal-body" }, [createVNode("label", { for: "resolution" }, "Решение:"), withDirectives(createVNode("textarea", {
							id: "resolution",
							"onUpdate:modelValue": ($event) => resolveModal.value.resolution = $event,
							rows: "5",
							minlength: "10",
							required: "",
							placeholder: "Опишите ваше решение (минимум 10 символов)"
						}, null, 8, ["onUpdate:modelValue"]), [[vModelText, resolveModal.value.resolution]])]), createVNode("div", { class: "modal-footer" }, [createVNode("button", {
							type: "button",
							onClick: closeResolveModal,
							class: "btn-cancel"
						}, "Отмена"), createVNode("button", {
							type: "submit",
							class: "btn-submit"
						}, "Отправить решение")])], 32)])])) : createCommentVNode("", true)
					])];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup$13 = _sfc_main$13.setup;
_sfc_main$13.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Disputes/Index.vue");
	return _sfc_setup$13 ? _sfc_setup$13(props, ctx) : void 0;
};
var Index_default$1 = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$13, [["__scopeId", "data-v-2a942cd1"]]);
//#endregion
//#region resources/js/Components/Post.vue
var _sfc_main$12 = {
	__name: "Post",
	__ssrInlineRender: true,
	props: { post: Object },
	setup(__props) {
		const props = __props;
		useDarkMode();
		const localLikes = ref(props.post.likes_count ?? 0);
		const isLiked = ref(props.post.is_liked ?? false);
		watch(() => props.post.likes_count, (newVal) => {
			localLikes.value = newVal;
		});
		watch(() => props.post.is_liked, (newVal) => {
			isLiked.value = newVal;
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "post" }, _attrs))} data-v-490b2f95><div class="badges" data-v-490b2f95>`);
			if (__props.post.is_vacancy) _push(`<div class="vacancy-badge" data-v-490b2f95>Вакансия</div>`);
			else _push(`<!---->`);
			if (__props.post.active === false && __props.post.status !== "closed") _push(`<div class="hidden-badge" title="Этот пост видите только вы" data-v-490b2f95><img src="/images/blind.svg" alt="Скрыто" data-v-490b2f95></div>`);
			else _push(`<!---->`);
			if (__props.post.status === "closed") _push(`<div class="closed-badge" data-v-490b2f95>Завершено</div>`);
			else _push(`<!---->`);
			_push(`</div>`);
			_push(ssrRenderComponent(unref(Link), { href: __props.post.show_url }, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) if (__props.post.image_url) _push(`<img${ssrRenderAttr("src", __props.post.image_url)}${ssrRenderAttr("alt", __props.post.title)} data-v-490b2f95${_scopeId}>`);
					else _push(`<!---->`);
					else return [__props.post.image_url ? (openBlock(), createBlock("img", {
						key: 0,
						src: __props.post.image_url,
						alt: __props.post.title
					}, null, 8, ["src", "alt"])) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(`<div class="post-content" data-v-490b2f95><div data-v-490b2f95>`);
			_push(ssrRenderComponent(unref(Link), { href: __props.post.show_url }, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<h3 class="title" data-v-490b2f95${_scopeId}>${ssrInterpolate(__props.post.title)}</h3>`);
					else return [createVNode("h3", { class: "title" }, toDisplayString(__props.post.title), 1)];
				}),
				_: 1
			}, _parent));
			_push(`<p class="description" data-v-490b2f95>${ssrInterpolate(__props.post.description)}</p></div><small data-v-490b2f95> Автор: `);
			_push(ssrRenderComponent(unref(Link), {
				href: __props.post.user.profile_url,
				class: "username"
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(__props.post.user.name)}`);
					else return [createTextVNode(toDisplayString(__props.post.user.name), 1)];
				}),
				_: 1
			}, _parent));
			_push(`</small><div class="post-actions" data-v-490b2f95><button type="button" class="${ssrRenderClass({ liked: isLiked.value })}" id="like" data-v-490b2f95>${ssrInterpolate(isLiked.value ? "❤️" : "🤍")} ${ssrInterpolate(localLikes.value)}</button></div></div></div>`);
		};
	}
};
var _sfc_setup$12 = _sfc_main$12.setup;
_sfc_main$12.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/Post.vue");
	return _sfc_setup$12 ? _sfc_setup$12(props, ctx) : void 0;
};
var Post_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$12, [["__scopeId", "data-v-490b2f95"]]);
//#endregion
//#region resources/js/Pages/Home.vue
var Home_exports = /* @__PURE__ */ __exportAll({ default: () => Home_default });
var _sfc_main$11 = /* @__PURE__ */ Object.assign({ layout: AppLayout_default }, {
	__name: "Home",
	__ssrInlineRender: true,
	props: {
		posts: {
			type: Array,
			default: () => []
		},
		skills: {
			type: Array,
			default: () => []
		},
		userSkills: {
			type: Array,
			default: () => []
		},
		auth: {
			type: Object,
			default: () => ({})
		}
	},
	setup(__props) {
		const props = __props;
		const posts = computed(() => props.posts || []);
		const authUser = computed(() => props.auth?.user || null);
		const { isDark, toggleDarkMode } = useDarkMode();
		const query = ref("");
		const typeFilter = ref("");
		const selectedSkills = ref([]);
		const activeTab = ref("all");
		const viewMode = ref(localStorage.getItem("viewMode") || "grid");
		const filtersVisible = ref(false);
		const filtersContainer = ref(null);
		const mainWrapper = ref(null);
		const syncFiltersHeight = () => {
			if (filtersContainer.value && mainWrapper.value) filtersContainer.value.style.height = mainWrapper.value.offsetHeight + "px";
		};
		onMounted(() => {
			nextTick(() => {
				syncFiltersHeight();
				window.addEventListener("resize", syncFiltersHeight);
			});
		});
		const calculateMatchPercentage = (vacancySkills, userSkillsArr) => {
			if (!vacancySkills || vacancySkills.length === 0) return 0;
			if (!userSkillsArr || userSkillsArr.length === 0) return 0;
			const userSkillIds = userSkillsArr.map((s) => s.id);
			const matchedSkills = vacancySkills.filter((vs) => userSkillIds.includes(vs.id));
			return Math.round(matchedSkills.length / vacancySkills.length * 100);
		};
		const forYouPosts = computed(() => {
			const userSkillsArr = props.userSkills.length > 0 ? props.userSkills : selectedSkills.value;
			if (userSkillsArr.length === 0) return [];
			return posts.value.filter((post) => post.is_vacancy && post.vacancy && post.vacancy.skills).map((post) => ({
				...post,
				matchPercentage: calculateMatchPercentage(post.vacancy.skills, userSkillsArr)
			})).filter((post) => post.matchPercentage > 0).sort((a, b) => b.matchPercentage - a.matchPercentage);
		});
		const filteredPosts = computed(() => {
			let result = posts.value;
			if (query.value) {
				const q = query.value.toLowerCase();
				result = result.filter((post) => post.title.toLowerCase().includes(q) || post.description.toLowerCase().includes(q));
			}
			if (typeFilter.value) if (typeFilter.value === "vacancy") result = result.filter((post) => post.is_vacancy);
			else result = result.filter((post) => !post.is_vacancy);
			if (selectedSkills.value.length > 0) {
				const skillIds = selectedSkills.value.map((s) => s.id);
				result = result.filter((post) => post.vacancy && post.vacancy.skills && post.vacancy.skills.some((s) => skillIds.includes(s.id)));
			}
			return result;
		});
		const displayedPosts = computed(() => {
			if (activeTab.value === "foryou") return forYouPosts.value;
			return filteredPosts.value;
		});
		watch(displayedPosts, () => {
			nextTick(syncFiltersHeight);
		});
		watch(viewMode, (newVal) => {
			localStorage.setItem("viewMode", newVal);
			nextTick(syncFiltersHeight);
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<!--[-->`);
			_push(ssrRenderComponent(unref(Head), { title: "Главная" }, null, _parent));
			_push(`<div class="block1" data-v-e33d44d1><img${ssrRenderAttr("src", unref(isDark) ? "/images/nightEarth.png" : "/images/Earth.png")} alt="Earth" class="hero-image" data-v-e33d44d1><p class="hero-title" data-v-e33d44d1><span class="visket-text" data-v-e33d44d1> V<span class="letter-i"${ssrRenderAttr("title", unref(isDark) ? "переключить на светлую тему" : "переключить на темную тему")} data-v-e33d44d1> I <svg class="sun-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-e33d44d1><circle cx="12" cy="12" r="5" fill="currentColor" data-v-e33d44d1></circle><path d="M12 2V4M12 20V22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M2 12H4M20 12H22M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93" stroke="currentColor" stroke-width="2" stroke-linecap="round" data-v-e33d44d1></path></svg></span>SKET </span> — место, где работа находит работника<br data-v-e33d44d1>и наоборот. </p></div><div class="block2" data-v-e33d44d1><button class="filter-toggle" data-v-e33d44d1> Фильтры <span data-v-e33d44d1>${ssrInterpolate(filtersVisible.value ? "▼" : "▶")}</span></button><div class="search-container" data-v-e33d44d1><input class="searchbar"${ssrRenderAttr("value", query.value)} type="text" placeholder="Поиск по постам" data-v-e33d44d1><div class="view-mode-toggle" data-v-e33d44d1><button class="${ssrRenderClass([{ active: viewMode.value === "grid" }, "view-mode-btn"])}" type="button" data-v-e33d44d1><img src="/images/grid-view.svg" alt="Сетка" data-v-e33d44d1></button><button class="${ssrRenderClass([{ active: viewMode.value === "list" }, "view-mode-btn"])}" type="button" data-v-e33d44d1><img src="/images/list-view.svg" alt="Список" data-v-e33d44d1></button></div></div></div><div class="${ssrRenderClass([{ filtersOpen: filtersVisible.value }, "content-wrapper"])}" data-v-e33d44d1><div class="filterscontainer" data-v-e33d44d1><div class="filters" data-v-e33d44d1><div class="filter-group" data-v-e33d44d1><label data-v-e33d44d1>Тип:</label><div class="type-selector" data-v-e33d44d1><button class="${ssrRenderClass({ active: typeFilter.value === "" })}" data-v-e33d44d1> Все </button><button class="${ssrRenderClass({ active: typeFilter.value === "vacancy" })}" data-v-e33d44d1> Вакансии </button><button class="${ssrRenderClass({ active: typeFilter.value === "post" })}" data-v-e33d44d1> Посты </button></div></div><div class="filter-group" data-v-e33d44d1><label data-v-e33d44d1>Навыки:</label>`);
			_push(ssrRenderComponent(SkillsSelector_default, {
				modelValue: selectedSkills.value,
				"onUpdate:modelValue": ($event) => selectedSkills.value = $event,
				skills: __props.skills
			}, null, _parent));
			_push(`</div>`);
			if (selectedSkills.value.length > 0) {
				_push(`<div class="selected-skills" data-v-e33d44d1><!--[-->`);
				ssrRenderList(selectedSkills.value, (skill) => {
					_push(`<div class="${ssrRenderClass([unref(getSkillClass)(skill.name), "skill-tag"])}" data-v-e33d44d1><span class="skill-name" data-v-e33d44d1>${ssrInterpolate(skill.name)}</span><div class="skill-level" data-v-e33d44d1><label data-v-e33d44d1>Уровень:</label><select data-v-e33d44d1><option${ssrRenderAttr("value", 1)} data-v-e33d44d1${ssrIncludeBooleanAttr(Array.isArray(skill.level) ? ssrLooseContain(skill.level, 1) : ssrLooseEqual(skill.level, 1)) ? " selected" : ""}>1</option><option${ssrRenderAttr("value", 2)} data-v-e33d44d1${ssrIncludeBooleanAttr(Array.isArray(skill.level) ? ssrLooseContain(skill.level, 2) : ssrLooseEqual(skill.level, 2)) ? " selected" : ""}>2</option><option${ssrRenderAttr("value", 3)} data-v-e33d44d1${ssrIncludeBooleanAttr(Array.isArray(skill.level) ? ssrLooseContain(skill.level, 3) : ssrLooseEqual(skill.level, 3)) ? " selected" : ""}>3</option><option${ssrRenderAttr("value", 4)} data-v-e33d44d1${ssrIncludeBooleanAttr(Array.isArray(skill.level) ? ssrLooseContain(skill.level, 4) : ssrLooseEqual(skill.level, 4)) ? " selected" : ""}>4</option><option${ssrRenderAttr("value", 5)} data-v-e33d44d1${ssrIncludeBooleanAttr(Array.isArray(skill.level) ? ssrLooseContain(skill.level, 5) : ssrLooseEqual(skill.level, 5)) ? " selected" : ""}>5</option></select></div><button type="button" class="remove-skill" data-v-e33d44d1>×</button></div>`);
				});
				_push(`<!--]--></div>`);
			} else _push(`<!---->`);
			_push(`</div></div><div class="main-wrapper" data-v-e33d44d1><div class="tabs" data-v-e33d44d1><button class="${ssrRenderClass({ active: activeTab.value === "all" })}" data-v-e33d44d1> Все посты </button><button class="${ssrRenderClass({ active: activeTab.value === "foryou" })}" data-v-e33d44d1> Для вас </button></div><div class="${ssrRenderClass([{ "list-mode": viewMode.value === "list" }, "posts"])}" data-v-e33d44d1>`);
			if (displayedPosts.value.length > 0) {
				_push(`<!--[-->`);
				ssrRenderList(displayedPosts.value, (post) => {
					_push(ssrRenderComponent(Post_default, {
						key: post.id,
						post
					}, null, _parent));
				});
				_push(`<!--]-->`);
			} else {
				_push(`<!--[-->`);
				if (activeTab.value === "foryou" && !authUser.value) {
					_push(`<p class="empty-message" data-v-e33d44d1> Чтобы подобрать для вас лучшую работу — `);
					_push(ssrRenderComponent(unref(Link), { href: "/login/" }, {
						default: withCtx((_, _push, _parent, _scopeId) => {
							if (_push) _push(`авторизуйтесь`);
							else return [createTextVNode("авторизуйтесь")];
						}),
						_: 1
					}, _parent));
					_push(`</p>`);
				} else _push(`<p class="empty-message" data-v-e33d44d1>Пока ничего нет</p>`);
				_push(`<!--]-->`);
			}
			_push(`</div></div></div><!--]-->`);
		};
	}
});
var _sfc_setup$11 = _sfc_main$11.setup;
_sfc_main$11.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Home.vue");
	return _sfc_setup$11 ? _sfc_setup$11(props, ctx) : void 0;
};
var Home_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$11, [["__scopeId", "data-v-e33d44d1"]]);
//#endregion
//#region resources/js/Pages/Posts/Create.vue
var Create_exports = /* @__PURE__ */ __exportAll({ default: () => Create_default });
var _sfc_main$10 = {
	__name: "Create",
	__ssrInlineRender: true,
	props: { skills: {
		type: Array,
		default: () => []
	} },
	setup(__props) {
		useDarkMode();
		const fileInputRef = ref(null);
		const imagePreviewRef = ref(null);
		const imagePreview = ref(null);
		const isDragging = ref(false);
		const postType = ref("regular");
		const form = useForm({
			title: "",
			description: "",
			image: null,
			position: "",
			budget_min: null,
			budget_max: null,
			deadline: "",
			requirements: "",
			skills: []
		});
		const handleAreaClick = () => {
			if (!imagePreview.value) fileInputRef.value.click();
		};
		const handleImageClick = () => {
			fileInputRef.value.click();
		};
		const handleFileSelect = (e) => {
			const file = e.target.files[0];
			if (file) processFile(file);
		};
		const handleDragOver = () => {
			if (!imagePreview.value) isDragging.value = true;
		};
		const handleDragLeave = () => {
			isDragging.value = false;
		};
		const handleDrop = (e) => {
			isDragging.value = false;
			if (!imagePreview.value) {
				const file = e.dataTransfer.files[0];
				if (file && file.type.startsWith("image/")) processFile(file);
			}
		};
		const processFile = (file) => {
			form.image = file;
			const reader = new FileReader();
			reader.onload = (e) => {
				imagePreview.value = e.target.result;
			};
			reader.readAsDataURL(file);
		};
		const handleImageLoad = () => {};
		const submit = () => {
			const url = postType.value === "vacancy" ? "/posts/vacancy" : "/posts";
			form.post(url, {
				forceFormData: true,
				preserveScroll: true,
				onSuccess: () => {
					form.reset();
					imagePreview.value = null;
				}
			});
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(AppLayout_default, _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(unref(Head), { title: "Создать новый пост" }, null, _parent, _scopeId));
						_push(`<div class="create-post-page" data-v-4d04f5d7${_scopeId}><form data-v-4d04f5d7${_scopeId}><div class="post-type-toggle" data-v-4d04f5d7${_scopeId}><button type="button" class="${ssrRenderClass({ active: postType.value === "regular" })}" data-v-4d04f5d7${_scopeId}> Обычный пост </button><button type="button" class="${ssrRenderClass({ active: postType.value === "vacancy" })}" data-v-4d04f5d7${_scopeId}> Вакансия </button></div><div class="block" data-v-4d04f5d7${_scopeId}><div class="${ssrRenderClass([{ "has-image": imagePreview.value }, "image-container"])}" data-v-4d04f5d7${_scopeId}><input type="file" accept="image/*" style="${ssrRenderStyle({ "display": "none" })}" data-v-4d04f5d7${_scopeId}>`);
						if (!imagePreview.value) _push(`<div class="${ssrRenderClass([{ dragging: isDragging.value }, "upload-area"])}" data-v-4d04f5d7${_scopeId}><div class="upload-instructions" data-v-4d04f5d7${_scopeId}><p data-v-4d04f5d7${_scopeId}>Перетащите изображение сюда или кликните для выбора</p><button type="button" class="upload-button" data-v-4d04f5d7${_scopeId}>+</button></div></div>`);
						else _push(`<img${ssrRenderAttr("src", imagePreview.value)} class="post-image" data-v-4d04f5d7${_scopeId}>`);
						if (imagePreview.value) _push(`<div class="image-overlay" data-v-4d04f5d7${_scopeId}><button type="button" class="change-image-btn" data-v-4d04f5d7${_scopeId}> Изменить фото </button></div>`);
						else _push(`<!---->`);
						_push(`</div><div class="content-wrapper" data-v-4d04f5d7${_scopeId}><div class="desc" data-v-4d04f5d7${_scopeId}>`);
						if (postType.value === "regular") _push(`<!--[--><input type="text"${ssrRenderAttr("value", unref(form).title)} placeholder="Заголовок поста" required class="title-input" data-v-4d04f5d7${_scopeId}><textarea placeholder="Описание поста" required class="description-textarea" data-v-4d04f5d7${_scopeId}>${ssrInterpolate(unref(form).description)}</textarea><!--]-->`);
						else _push(`<!---->`);
						if (postType.value === "vacancy") {
							_push(`<div class="vacancy-fields" data-v-4d04f5d7${_scopeId}><div class="form-row" data-v-4d04f5d7${_scopeId}><div class="form-group" data-v-4d04f5d7${_scopeId}><label for="position" data-v-4d04f5d7${_scopeId}>Должность</label><input type="text"${ssrRenderAttr("value", unref(form).position)} id="position" placeholder="Например: PHP разработчик" data-v-4d04f5d7${_scopeId}></div></div><div class="form-row two-cols" data-v-4d04f5d7${_scopeId}><div class="form-group" data-v-4d04f5d7${_scopeId}><label for="budget_min" data-v-4d04f5d7${_scopeId}>Бюджет от</label><input type="number"${ssrRenderAttr("value", unref(form).budget_min)} id="budget_min" placeholder="1000" data-v-4d04f5d7${_scopeId}></div><div class="form-group" data-v-4d04f5d7${_scopeId}><label for="budget_max" data-v-4d04f5d7${_scopeId}>Бюджет до</label><input type="number"${ssrRenderAttr("value", unref(form).budget_max)} id="budget_max" placeholder="5000" data-v-4d04f5d7${_scopeId}></div></div><div class="form-row" data-v-4d04f5d7${_scopeId}><div class="form-group" data-v-4d04f5d7${_scopeId}><label for="deadline" data-v-4d04f5d7${_scopeId}>Срок выполнения</label><input type="date"${ssrRenderAttr("value", unref(form).deadline)} id="deadline" data-v-4d04f5d7${_scopeId}></div></div><div class="form-row" data-v-4d04f5d7${_scopeId}><div class="form-group" data-v-4d04f5d7${_scopeId}><label data-v-4d04f5d7${_scopeId}>Требуемые навыки</label>`);
							_push(ssrRenderComponent(SkillsSelector_default, {
								skills: __props.skills,
								modelValue: unref(form).skills,
								"onUpdate:modelValue": ($event) => unref(form).skills = $event
							}, null, _parent, _scopeId));
							_push(`</div></div><div class="form-row" data-v-4d04f5d7${_scopeId}><div class="form-group" data-v-4d04f5d7${_scopeId}><label for="requirements" data-v-4d04f5d7${_scopeId}>Требования</label><textarea id="requirements" placeholder="Опишите требования к исполнителю..." class="requirements-textarea" data-v-4d04f5d7${_scopeId}>${ssrInterpolate(unref(form).requirements)}</textarea></div></div></div>`);
						} else _push(`<!---->`);
						_push(`<div class="form-actions" data-v-4d04f5d7${_scopeId}><button type="submit" class="submit-button"${ssrIncludeBooleanAttr(unref(form).processing || !unref(form).image) ? " disabled" : ""} data-v-4d04f5d7${_scopeId}>${ssrInterpolate(unref(form).processing ? "Публикация..." : postType.value === "vacancy" ? "Опубликовать вакансию" : "Опубликовать")}</button></div></div></div></div></form></div>`);
					} else return [createVNode(unref(Head), { title: "Создать новый пост" }), createVNode("div", { class: "create-post-page" }, [createVNode("form", { onSubmit: withModifiers(submit, ["prevent"]) }, [createVNode("div", { class: "post-type-toggle" }, [createVNode("button", {
						type: "button",
						class: { active: postType.value === "regular" },
						onClick: ($event) => postType.value = "regular"
					}, " Обычный пост ", 10, ["onClick"]), createVNode("button", {
						type: "button",
						class: { active: postType.value === "vacancy" },
						onClick: ($event) => postType.value = "vacancy"
					}, " Вакансия ", 10, ["onClick"])]), createVNode("div", { class: "block" }, [createVNode("div", {
						class: ["image-container", { "has-image": imagePreview.value }],
						onClick: handleAreaClick,
						onDragover: withModifiers(handleDragOver, ["prevent"]),
						onDragleave: handleDragLeave,
						onDrop: withModifiers(handleDrop, ["prevent"])
					}, [
						createVNode("input", {
							type: "file",
							ref_key: "fileInputRef",
							ref: fileInputRef,
							accept: "image/*",
							style: { "display": "none" },
							onChange: handleFileSelect
						}, null, 544),
						!imagePreview.value ? (openBlock(), createBlock("div", {
							key: 0,
							class: ["upload-area", { dragging: isDragging.value }]
						}, [createVNode("div", { class: "upload-instructions" }, [createVNode("p", null, "Перетащите изображение сюда или кликните для выбора"), createVNode("button", {
							type: "button",
							class: "upload-button"
						}, "+")])], 2)) : (openBlock(), createBlock("img", {
							key: 1,
							src: imagePreview.value,
							ref_key: "imagePreviewRef",
							ref: imagePreviewRef,
							class: "post-image",
							onLoad: handleImageLoad,
							onClick: withModifiers(handleImageClick, ["stop"])
						}, null, 40, ["src"])),
						imagePreview.value ? (openBlock(), createBlock("div", {
							key: 2,
							class: "image-overlay"
						}, [createVNode("button", {
							type: "button",
							onClick: withModifiers(handleImageClick, ["stop"]),
							class: "change-image-btn"
						}, " Изменить фото ")])) : createCommentVNode("", true)
					], 34), createVNode("div", { class: "content-wrapper" }, [createVNode("div", { class: "desc" }, [
						postType.value === "regular" ? (openBlock(), createBlock(Fragment, { key: 0 }, [withDirectives(createVNode("input", {
							type: "text",
							"onUpdate:modelValue": ($event) => unref(form).title = $event,
							placeholder: "Заголовок поста",
							required: "",
							class: "title-input"
						}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).title]]), withDirectives(createVNode("textarea", {
							"onUpdate:modelValue": ($event) => unref(form).description = $event,
							placeholder: "Описание поста",
							required: "",
							class: "description-textarea"
						}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).description]])], 64)) : createCommentVNode("", true),
						postType.value === "vacancy" ? (openBlock(), createBlock("div", {
							key: 1,
							class: "vacancy-fields"
						}, [
							createVNode("div", { class: "form-row" }, [createVNode("div", { class: "form-group" }, [createVNode("label", { for: "position" }, "Должность"), withDirectives(createVNode("input", {
								type: "text",
								"onUpdate:modelValue": ($event) => unref(form).position = $event,
								id: "position",
								placeholder: "Например: PHP разработчик"
							}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).position]])])]),
							createVNode("div", { class: "form-row two-cols" }, [createVNode("div", { class: "form-group" }, [createVNode("label", { for: "budget_min" }, "Бюджет от"), withDirectives(createVNode("input", {
								type: "number",
								"onUpdate:modelValue": ($event) => unref(form).budget_min = $event,
								id: "budget_min",
								placeholder: "1000"
							}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).budget_min]])]), createVNode("div", { class: "form-group" }, [createVNode("label", { for: "budget_max" }, "Бюджет до"), withDirectives(createVNode("input", {
								type: "number",
								"onUpdate:modelValue": ($event) => unref(form).budget_max = $event,
								id: "budget_max",
								placeholder: "5000"
							}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).budget_max]])])]),
							createVNode("div", { class: "form-row" }, [createVNode("div", { class: "form-group" }, [createVNode("label", { for: "deadline" }, "Срок выполнения"), withDirectives(createVNode("input", {
								type: "date",
								"onUpdate:modelValue": ($event) => unref(form).deadline = $event,
								id: "deadline"
							}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).deadline]])])]),
							createVNode("div", { class: "form-row" }, [createVNode("div", { class: "form-group" }, [createVNode("label", null, "Требуемые навыки"), createVNode(SkillsSelector_default, {
								skills: __props.skills,
								modelValue: unref(form).skills,
								"onUpdate:modelValue": ($event) => unref(form).skills = $event
							}, null, 8, [
								"skills",
								"modelValue",
								"onUpdate:modelValue"
							])])]),
							createVNode("div", { class: "form-row" }, [createVNode("div", { class: "form-group" }, [createVNode("label", { for: "requirements" }, "Требования"), withDirectives(createVNode("textarea", {
								"onUpdate:modelValue": ($event) => unref(form).requirements = $event,
								id: "requirements",
								placeholder: "Опишите требования к исполнителю...",
								class: "requirements-textarea"
							}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).requirements]])])])
						])) : createCommentVNode("", true),
						createVNode("div", { class: "form-actions" }, [createVNode("button", {
							type: "submit",
							class: "submit-button",
							disabled: unref(form).processing || !unref(form).image
						}, toDisplayString(unref(form).processing ? "Публикация..." : postType.value === "vacancy" ? "Опубликовать вакансию" : "Опубликовать"), 9, ["disabled"])])
					])])])], 32)])];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup$10 = _sfc_main$10.setup;
_sfc_main$10.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Posts/Create.vue");
	return _sfc_setup$10 ? _sfc_setup$10(props, ctx) : void 0;
};
var Create_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$10, [["__scopeId", "data-v-4d04f5d7"]]);
//#endregion
//#region resources/js/Pages/Posts/Edit.vue
var Edit_exports$1 = /* @__PURE__ */ __exportAll({ default: () => Edit_default$1 });
var _sfc_main$9 = {
	__name: "Edit",
	__ssrInlineRender: true,
	props: {
		post: Object,
		skills: {
			type: Array,
			default: () => []
		}
	},
	setup(__props) {
		const props = __props;
		useDarkMode();
		const fileInputRef = ref(null);
		const imagePreview = ref(props.post.image_url);
		const isDragging = ref(false);
		const isVacancy = computed(() => props.post.vacancy !== null);
		const form = useForm({
			title: props.post.title,
			description: props.post.description,
			image: null,
			position: props.post.vacancy?.position || "",
			budget_min: props.post.vacancy?.budget_min || "",
			budget_max: props.post.vacancy?.budget_max || "",
			deadline: props.post.vacancy?.deadline || "",
			requirements: props.post.vacancy?.requirements || "",
			skills: [],
			_method: "PUT"
		});
		onMounted(() => {
			if (props.post.vacancy && props.post.vacancy.skills) form.skills = props.post.vacancy.skills.map((s) => ({
				id: s.id,
				name: s.name,
				level: s.level || 3
			}));
		});
		const handleAreaClick = () => {
			if (!imagePreview.value) fileInputRef.value.click();
		};
		const handleImageClick = () => {
			fileInputRef.value.click();
		};
		const handleFileSelect = (e) => {
			const file = e.target.files[0];
			if (file) processFile(file);
		};
		const handleDragOver = () => {
			isDragging.value = true;
		};
		const handleDragLeave = () => {
			isDragging.value = false;
		};
		const handleDrop = (e) => {
			isDragging.value = false;
			const file = e.dataTransfer.files[0];
			if (file && file.type.startsWith("image/")) processFile(file);
		};
		const processFile = (file) => {
			form.image = file;
			const reader = new FileReader();
			reader.onload = (e) => {
				imagePreview.value = e.target.result;
			};
			reader.readAsDataURL(file);
		};
		const submit = () => {
			const data = {
				title: form.title,
				description: form.description,
				_method: "PUT"
			};
			if (form.image) data.image = form.image;
			if (isVacancy.value) {
				data.position = form.position;
				data.budget_min = form.budget_min || null;
				data.budget_max = form.budget_max || null;
				data.deadline = form.deadline || null;
				data.requirements = form.requirements || null;
				const skillsWithLevels = {};
				form.skills.forEach((s) => {
					skillsWithLevels[s.id] = { level: s.level };
				});
				data.skills = skillsWithLevels;
			}
			form.transform(() => data).post(props.post.update_url, {
				forceFormData: true,
				preserveScroll: true
			});
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(AppLayout_default, _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(unref(Head), { title: "Редактировать пост" }, null, _parent, _scopeId));
						_push(`<div class="edit-post-page" data-v-a61a8725${_scopeId}><form data-v-a61a8725${_scopeId}><div class="block" data-v-a61a8725${_scopeId}><div class="image-container" data-v-a61a8725${_scopeId}><input type="file" accept="image/*" style="${ssrRenderStyle({ "display": "none" })}" data-v-a61a8725${_scopeId}>`);
						if (imagePreview.value) _push(`<img${ssrRenderAttr("src", imagePreview.value)} class="post-image" data-v-a61a8725${_scopeId}>`);
						else _push(`<div class="no-image" data-v-a61a8725${_scopeId}><span data-v-a61a8725${_scopeId}>Изображение отсутствует</span></div>`);
						if (imagePreview.value) _push(`<div class="image-overlay" data-v-a61a8725${_scopeId}><button type="button" class="change-image-btn" data-v-a61a8725${_scopeId}> Изменить фото </button></div>`);
						else _push(`<!---->`);
						_push(`</div><div class="content-wrapper" data-v-a61a8725${_scopeId}><div class="desc" data-v-a61a8725${_scopeId}>`);
						if (!isVacancy.value) _push(`<!--[--><input type="text"${ssrRenderAttr("value", unref(form).title)} placeholder="Заголовок поста" required class="title-input" data-v-a61a8725${_scopeId}><textarea placeholder="Описание поста" required class="description-textarea" data-v-a61a8725${_scopeId}>${ssrInterpolate(unref(form).description)}</textarea><!--]-->`);
						else {
							_push(`<div class="vacancy-fields" data-v-a61a8725${_scopeId}><div class="form-row" data-v-a61a8725${_scopeId}><div class="form-group" data-v-a61a8725${_scopeId}><label for="position" data-v-a61a8725${_scopeId}>Должность</label><input type="text"${ssrRenderAttr("value", unref(form).position)} id="position" placeholder="Например: PHP разработчик" data-v-a61a8725${_scopeId}></div></div><div class="form-row two-cols" data-v-a61a8725${_scopeId}><div class="form-group" data-v-a61a8725${_scopeId}><label for="budget_min" data-v-a61a8725${_scopeId}>Бюджет от</label><input type="number"${ssrRenderAttr("value", unref(form).budget_min)} id="budget_min" placeholder="1000" data-v-a61a8725${_scopeId}></div><div class="form-group" data-v-a61a8725${_scopeId}><label for="budget_max" data-v-a61a8725${_scopeId}>Бюджет до</label><input type="number"${ssrRenderAttr("value", unref(form).budget_max)} id="budget_max" placeholder="5000" data-v-a61a8725${_scopeId}></div></div><div class="form-row" data-v-a61a8725${_scopeId}><div class="form-group" data-v-a61a8725${_scopeId}><label for="deadline" data-v-a61a8725${_scopeId}>Срок выполнения</label><input type="date"${ssrRenderAttr("value", unref(form).deadline)} id="deadline" data-v-a61a8725${_scopeId}></div></div><div class="form-row" data-v-a61a8725${_scopeId}><div class="form-group" data-v-a61a8725${_scopeId}><label for="requirements" data-v-a61a8725${_scopeId}>Требования</label><textarea id="requirements" placeholder="Опишите требования к исполнителю..." rows="4" data-v-a61a8725${_scopeId}>${ssrInterpolate(unref(form).requirements)}</textarea></div></div><div class="form-row" data-v-a61a8725${_scopeId}><div class="form-group" data-v-a61a8725${_scopeId}><label data-v-a61a8725${_scopeId}>Требуемые навыки</label>`);
							_push(ssrRenderComponent(SkillsSelector_default, {
								skills: __props.skills,
								modelValue: unref(form).skills,
								"onUpdate:modelValue": ($event) => unref(form).skills = $event
							}, null, _parent, _scopeId));
							_push(`</div></div></div>`);
						}
						if (unref(form).errors.title) _push(`<div class="error" data-v-a61a8725${_scopeId}>${ssrInterpolate(unref(form).errors.title)}</div>`);
						else _push(`<!---->`);
						if (unref(form).errors.description) _push(`<div class="error" data-v-a61a8725${_scopeId}>${ssrInterpolate(unref(form).errors.description)}</div>`);
						else _push(`<!---->`);
						if (unref(form).errors.image) _push(`<div class="error" data-v-a61a8725${_scopeId}>${ssrInterpolate(unref(form).errors.image)}</div>`);
						else _push(`<!---->`);
						_push(`<div class="form-actions" data-v-a61a8725${_scopeId}>`);
						_push(ssrRenderComponent(unref(Link), {
							href: __props.post.show_url,
							class: "cancel-button"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`Отмена`);
								else return [createTextVNode("Отмена")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`<button type="submit" class="submit-button"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""} data-v-a61a8725${_scopeId}>${ssrInterpolate(unref(form).processing ? "Сохранение..." : "Сохранить")}</button></div></div></div></div></form></div>`);
					} else return [createVNode(unref(Head), { title: "Редактировать пост" }), createVNode("div", { class: "edit-post-page" }, [createVNode("form", { onSubmit: withModifiers(submit, ["prevent"]) }, [createVNode("div", { class: "block" }, [createVNode("div", {
						class: "image-container",
						onClick: handleAreaClick,
						onDragover: withModifiers(handleDragOver, ["prevent"]),
						onDragleave: handleDragLeave,
						onDrop: withModifiers(handleDrop, ["prevent"])
					}, [
						createVNode("input", {
							type: "file",
							ref_key: "fileInputRef",
							ref: fileInputRef,
							accept: "image/*",
							style: { "display": "none" },
							onChange: handleFileSelect
						}, null, 544),
						imagePreview.value ? (openBlock(), createBlock("img", {
							key: 0,
							src: imagePreview.value,
							class: "post-image",
							onClick: withModifiers(handleImageClick, ["stop"])
						}, null, 8, ["src"])) : (openBlock(), createBlock("div", {
							key: 1,
							class: "no-image"
						}, [createVNode("span", null, "Изображение отсутствует")])),
						imagePreview.value ? (openBlock(), createBlock("div", {
							key: 2,
							class: "image-overlay"
						}, [createVNode("button", {
							type: "button",
							onClick: withModifiers(handleImageClick, ["stop"]),
							class: "change-image-btn"
						}, " Изменить фото ")])) : createCommentVNode("", true)
					], 32), createVNode("div", { class: "content-wrapper" }, [createVNode("div", { class: "desc" }, [
						!isVacancy.value ? (openBlock(), createBlock(Fragment, { key: 0 }, [withDirectives(createVNode("input", {
							type: "text",
							"onUpdate:modelValue": ($event) => unref(form).title = $event,
							placeholder: "Заголовок поста",
							required: "",
							class: "title-input"
						}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).title]]), withDirectives(createVNode("textarea", {
							"onUpdate:modelValue": ($event) => unref(form).description = $event,
							placeholder: "Описание поста",
							required: "",
							class: "description-textarea"
						}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).description]])], 64)) : (openBlock(), createBlock("div", {
							key: 1,
							class: "vacancy-fields"
						}, [
							createVNode("div", { class: "form-row" }, [createVNode("div", { class: "form-group" }, [createVNode("label", { for: "position" }, "Должность"), withDirectives(createVNode("input", {
								type: "text",
								"onUpdate:modelValue": ($event) => unref(form).position = $event,
								id: "position",
								placeholder: "Например: PHP разработчик"
							}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).position]])])]),
							createVNode("div", { class: "form-row two-cols" }, [createVNode("div", { class: "form-group" }, [createVNode("label", { for: "budget_min" }, "Бюджет от"), withDirectives(createVNode("input", {
								type: "number",
								"onUpdate:modelValue": ($event) => unref(form).budget_min = $event,
								id: "budget_min",
								placeholder: "1000"
							}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).budget_min]])]), createVNode("div", { class: "form-group" }, [createVNode("label", { for: "budget_max" }, "Бюджет до"), withDirectives(createVNode("input", {
								type: "number",
								"onUpdate:modelValue": ($event) => unref(form).budget_max = $event,
								id: "budget_max",
								placeholder: "5000"
							}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).budget_max]])])]),
							createVNode("div", { class: "form-row" }, [createVNode("div", { class: "form-group" }, [createVNode("label", { for: "deadline" }, "Срок выполнения"), withDirectives(createVNode("input", {
								type: "date",
								"onUpdate:modelValue": ($event) => unref(form).deadline = $event,
								id: "deadline"
							}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).deadline]])])]),
							createVNode("div", { class: "form-row" }, [createVNode("div", { class: "form-group" }, [createVNode("label", { for: "requirements" }, "Требования"), withDirectives(createVNode("textarea", {
								"onUpdate:modelValue": ($event) => unref(form).requirements = $event,
								id: "requirements",
								placeholder: "Опишите требования к исполнителю...",
								rows: "4"
							}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).requirements]])])]),
							createVNode("div", { class: "form-row" }, [createVNode("div", { class: "form-group" }, [createVNode("label", null, "Требуемые навыки"), createVNode(SkillsSelector_default, {
								skills: __props.skills,
								modelValue: unref(form).skills,
								"onUpdate:modelValue": ($event) => unref(form).skills = $event
							}, null, 8, [
								"skills",
								"modelValue",
								"onUpdate:modelValue"
							])])])
						])),
						unref(form).errors.title ? (openBlock(), createBlock("div", {
							key: 2,
							class: "error"
						}, toDisplayString(unref(form).errors.title), 1)) : createCommentVNode("", true),
						unref(form).errors.description ? (openBlock(), createBlock("div", {
							key: 3,
							class: "error"
						}, toDisplayString(unref(form).errors.description), 1)) : createCommentVNode("", true),
						unref(form).errors.image ? (openBlock(), createBlock("div", {
							key: 4,
							class: "error"
						}, toDisplayString(unref(form).errors.image), 1)) : createCommentVNode("", true),
						createVNode("div", { class: "form-actions" }, [createVNode(unref(Link), {
							href: __props.post.show_url,
							class: "cancel-button"
						}, {
							default: withCtx(() => [createTextVNode("Отмена")]),
							_: 1
						}, 8, ["href"]), createVNode("button", {
							type: "submit",
							class: "submit-button",
							disabled: unref(form).processing
						}, toDisplayString(unref(form).processing ? "Сохранение..." : "Сохранить"), 9, ["disabled"])])
					])])])], 32)])];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup$9 = _sfc_main$9.setup;
_sfc_main$9.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Posts/Edit.vue");
	return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
var Edit_default$1 = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$9, [["__scopeId", "data-v-a61a8725"]]);
//#endregion
//#region resources/js/Pages/Posts/Show.vue
var Show_exports$1 = /* @__PURE__ */ __exportAll({ default: () => Show_default$1 });
var _sfc_main$8 = /* @__PURE__ */ Object.assign({ layout: AppLayout_default }, {
	__name: "Show",
	__ssrInlineRender: true,
	props: { post: {
		type: Object,
		required: true
	} },
	setup(__props) {
		const menuOpen = ref(false);
		const activeTab = ref("comments");
		const commentErrors = ref({});
		const showRespondModal = ref(false);
		const showReportModal = ref(false);
		const showShareModal = ref(false);
		const reportErrors = ref({});
		const shareErrors = ref({});
		const respondForm = useForm({
			cover_letter: "",
			proposed_price: ""
		});
		const reportForm = useForm({ reason: "" });
		const shareForm = useForm({
			users: [],
			message: ""
		});
		const props = __props;
		useDarkMode();
		const page = usePage();
		const commentForm = useForm({ text: "" });
		const canEdit = computed(() => {
			return page.props.auth.user && page.props.auth.user.id === props.post.user.id;
		});
		const isAuthor = computed(() => {
			return page.props.auth.user && page.props.auth.user.id === props.post.user.id;
		});
		const canReport = computed(() => {
			return page.props.auth.user && page.props.auth.user.id !== props.post.user.id;
		});
		const sharedChats = computed(() => {
			return props.post.shared_chats || [];
		});
		const formattedDate = computed(() => {
			if (props.post.created_at) return new Date(props.post.created_at).toLocaleDateString("ru-RU", {
				day: "numeric",
				month: "long",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit"
			});
			return "";
		});
		const getApplicationsWord = (count) => {
			return [
				"отклик",
				"отклика",
				"откликов"
			][count % 100 > 4 && count % 100 < 20 ? 2 : [
				2,
				0,
				1,
				1,
				1,
				2
			][Math.min(count % 10, 5)]];
		};
		const formatDate = (dateString) => {
			const date = new Date(dateString);
			const diffInSeconds = Math.floor((/* @__PURE__ */ new Date() - date) / 1e3);
			if (diffInSeconds < 60) return "только что";
			if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} мин. назад`;
			if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ч. назад`;
			return date.toLocaleDateString("ru-RU", {
				day: "numeric",
				month: "short",
				year: diffInSeconds > 31536e3 ? "numeric" : void 0
			});
		};
		const formatDeadline = (dateString) => {
			return new Date(dateString).toLocaleDateString("ru-RU", {
				day: "numeric",
				month: "long",
				year: "numeric"
			});
		};
		const closeMenuOnClickOutside = (event) => {
			const menuContainer = document.querySelector(".menu-container");
			if (menuContainer && !menuContainer.contains(event.target)) menuOpen.value = false;
		};
		onMounted(() => {
			document.addEventListener("click", closeMenuOnClickOutside);
		});
		onUnmounted(() => {
			document.removeEventListener("click", closeMenuOnClickOutside);
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(_attrs)} data-v-bc713e03>`);
			_push(ssrRenderComponent(unref(Head), { title: __props.post.title }, null, _parent));
			_push(`<div class="block" data-v-bc713e03><div class="image-container" data-v-bc713e03>`);
			if (__props.post.image_url) _push(`<img${ssrRenderAttr("src", __props.post.image_url)}${ssrRenderAttr("alt", __props.post.title)} class="post-image" data-v-bc713e03>`);
			else _push(`<div class="no-image" data-v-bc713e03><span data-v-bc713e03>Изображение отсутствует</span></div>`);
			_push(`</div><div class="content-wrapper" data-v-bc713e03>`);
			if (__props.post.is_hidden) _push(`<div class="hidden-warning" data-v-bc713e03> ⚠️ Этот пост скрыт администрацией и виден только вам </div>`);
			else _push(`<!---->`);
			_push(`<div class="desc" data-v-bc713e03><div class="header-actions" data-v-bc713e03>`);
			if (__props.post.is_vacancy) _push(`<h2 class="title" data-v-bc713e03>Вакансия: ${ssrInterpolate(__props.post.vacancy.position)}</h2>`);
			else _push(`<h2 class="title" data-v-bc713e03>${ssrInterpolate(__props.post.title)}</h2>`);
			if (canEdit.value || canReport.value) {
				_push(`<div class="menu-container" data-v-bc713e03><button class="menu-btn" type="button" data-v-bc713e03><img src="/images/dots.svg" alt="меню" data-v-bc713e03></button>`);
				if (menuOpen.value) {
					_push(`<div class="post-dropdown-menu" data-v-bc713e03><button class="menu-item" data-v-bc713e03><img src="/images/share.svg" alt="" data-v-bc713e03>Поделиться </button>`);
					if (__props.post.edit_url) _push(ssrRenderComponent(unref(Link), {
						href: __props.post.edit_url,
						class: "menu-item"
					}, {
						default: withCtx((_, _push, _parent, _scopeId) => {
							if (_push) _push(`<img src="/images/edit.svg" alt="" data-v-bc713e03${_scopeId}>Редактировать `);
							else return [createVNode("img", {
								src: "/images/edit.svg",
								alt: ""
							}), createTextVNode("Редактировать ")];
						}),
						_: 1
					}, _parent));
					else _push(`<!---->`);
					if (__props.post.delete_url) _push(`<button class="menu-item delete" data-v-bc713e03><img src="/images/trash.svg" alt="" data-v-bc713e03> Удалить </button>`);
					else _push(`<!---->`);
					if (canReport.value) _push(`<button class="menu-item" data-v-bc713e03><img src="/images/flag.svg" alt="" data-v-bc713e03>Пожаловаться </button>`);
					else _push(`<!---->`);
					_push(`</div>`);
				} else _push(`<!---->`);
				_push(`</div>`);
			} else _push(`<!---->`);
			_push(`</div>`);
			_push(ssrRenderComponent(unref(Link), {
				href: __props.post.user.profile_url,
				class: "author-link"
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (__props.post.user.avatar_url) _push(`<img${ssrRenderAttr("src", __props.post.user.avatar_url)} class="author-avatar"${ssrRenderAttr("alt", __props.post.user.name)} data-v-bc713e03${_scopeId}>`);
						else _push(`<img src="/images/User-avatar.png" class="author-avatar"${ssrRenderAttr("alt", __props.post.user.name)} data-v-bc713e03${_scopeId}>`);
						_push(` ${ssrInterpolate(__props.post.user.name)}`);
					} else return [__props.post.user.avatar_url ? (openBlock(), createBlock("img", {
						key: 0,
						src: __props.post.user.avatar_url,
						class: "author-avatar",
						alt: __props.post.user.name
					}, null, 8, ["src", "alt"])) : (openBlock(), createBlock("img", {
						key: 1,
						src: "/images/User-avatar.png",
						class: "author-avatar",
						alt: __props.post.user.name
					}, null, 8, ["alt"])), createTextVNode(" " + toDisplayString(__props.post.user.name), 1)];
				}),
				_: 1
			}, _parent));
			_push(`<div class="post-actions" data-v-bc713e03><button type="button" class="${ssrRenderClass([{ liked: __props.post.is_liked }, "like-btn"])}" data-v-bc713e03>${ssrInterpolate(__props.post.is_liked ? "❤️" : "🤍")} ${ssrInterpolate(__props.post.likes_count)}</button></div>`);
			if (__props.post.is_vacancy) {
				_push(`<!--[--><div class="vacancy-info" data-v-bc713e03>`);
				if (__props.post.vacancy.budget_min || __props.post.vacancy.budget_max) _push(`<div class="vacancy-budget" data-v-bc713e03><span class="label" data-v-bc713e03>Бюджет:</span><span class="value" data-v-bc713e03>${ssrInterpolate(__props.post.vacancy.budget_min ? __props.post.vacancy.budget_min + " ₽" : "")} ${ssrInterpolate(__props.post.vacancy.budget_min && __props.post.vacancy.budget_max ? " - " : "")} ${ssrInterpolate(__props.post.vacancy.budget_max ? __props.post.vacancy.budget_max + " ₽" : "")}</span></div>`);
				else _push(`<!---->`);
				if (__props.post.vacancy.deadline) _push(`<div class="vacancy-deadline" data-v-bc713e03><span class="label" data-v-bc713e03>Срок:</span><span class="value" data-v-bc713e03>${ssrInterpolate(formatDeadline(__props.post.vacancy.deadline))}</span></div>`);
				else _push(`<!---->`);
				if (__props.post.vacancy.skills && __props.post.vacancy.skills.length > 0) {
					_push(`<div class="vacancy-skills" data-v-bc713e03><span class="label" data-v-bc713e03>Требуемые навыки:</span><div class="skills-list" data-v-bc713e03><!--[-->`);
					ssrRenderList(__props.post.vacancy.skills, (skill) => {
						_push(`<span class="${ssrRenderClass([unref(getSkillClass)(skill.name), "skill-tag"])}" data-v-bc713e03>${ssrInterpolate(skill.name)} <span class="skill-level" data-v-bc713e03>★ ${ssrInterpolate(skill.level)}</span></span>`);
					});
					_push(`<!--]--></div>`);
					if (__props.post.vacancy.requirements) _push(`<div class="vacancy-requirements" data-v-bc713e03><span class="label" data-v-bc713e03>Требования:</span><p class="requirements-text" data-v-bc713e03>${ssrInterpolate(__props.post.vacancy.requirements)}</p></div>`);
					else _push(`<!---->`);
					_push(`</div>`);
				} else _push(`<!---->`);
				_push(`</div>`);
				if (__props.post.vacancy && __props.post.vacancy.status === "open") {
					_push(`<div class="vacancy-actions" data-v-bc713e03>`);
					if (__props.post.vacancy.applications_count > 0) _push(`<div class="applications-count" data-v-bc713e03>${ssrInterpolate(__props.post.vacancy.applications_count)} ${ssrInterpolate(getApplicationsWord(__props.post.vacancy.applications_count))} на эту вакансию </div>`);
					else _push(`<!---->`);
					if (!isAuthor.value && __props.post.respond_url) _push(`<button class="respond-btn"${ssrIncludeBooleanAttr(__props.post.has_application) ? " disabled" : ""} data-v-bc713e03>${ssrInterpolate(__props.post.has_application ? "Вы уже откликнулись" : "Откликнуться")}</button>`);
					else _push(`<!---->`);
					_push(`</div>`);
				} else _push(`<!---->`);
				_push(`<!--]-->`);
			} else _push(`<p class="description" data-v-bc713e03>${ssrInterpolate(__props.post.description)}</p>`);
			_push(`<div class="meta" data-v-bc713e03><small data-v-bc713e03>${ssrInterpolate(formattedDate.value)}</small></div></div></div></div><div class="comments-section-wrapper" data-v-bc713e03>`);
			if (__props.post.is_vacancy && canEdit.value) _push(`<div class="tabs" data-v-bc713e03><button class="${ssrRenderClass([{ active: activeTab.value === "applications" }, "tab"])}" data-v-bc713e03> Список откликнувшихся (${ssrInterpolate(__props.post.vacancy.applications?.length || 0)}) </button><button class="${ssrRenderClass([{ active: activeTab.value === "comments" }, "tab"])}" data-v-bc713e03> Комментарии (${ssrInterpolate(__props.post.comments.length)}) </button></div>`);
			else _push(`<!---->`);
			_push(`<div class="comments-section" data-v-bc713e03>`);
			if (!__props.post.is_vacancy || !canEdit.value || activeTab.value === "comments") {
				_push(`<!--[-->`);
				if (_ctx.$page.props.auth.user) {
					_push(`<div class="comment-form" data-v-bc713e03><form data-v-bc713e03>`);
					if (commentErrors.value.text) _push(`<div class="error" data-v-bc713e03>${ssrInterpolate(commentErrors.value.text)}</div>`);
					else _push(`<!---->`);
					_push(`<textarea required placeholder="Напишите комментарий"${ssrIncludeBooleanAttr(unref(commentForm).processing) ? " disabled" : ""} data-v-bc713e03>${ssrInterpolate(unref(commentForm).text)}</textarea><button type="submit"${ssrIncludeBooleanAttr(unref(commentForm).processing) ? " disabled" : ""} data-v-bc713e03>${ssrInterpolate(unref(commentForm).processing ? "Отправка..." : "Добавить комментарий")}</button></form></div>`);
				} else {
					_push(`<div class="login-prompt" data-v-bc713e03><p data-v-bc713e03>Чтобы оставить комментарий, `);
					_push(ssrRenderComponent(unref(Link), { href: "/login" }, {
						default: withCtx((_, _push, _parent, _scopeId) => {
							if (_push) _push(`войдите`);
							else return [createTextVNode("войдите")];
						}),
						_: 1
					}, _parent));
					_push(` или `);
					_push(ssrRenderComponent(unref(Link), { href: "/register" }, {
						default: withCtx((_, _push, _parent, _scopeId) => {
							if (_push) _push(`зарегистрируйтесь`);
							else return [createTextVNode("зарегистрируйтесь")];
						}),
						_: 1
					}, _parent));
					_push(`</p></div>`);
				}
				_push(`<h3 data-v-bc713e03>Комментарии (${ssrInterpolate(__props.post.comments.length)})</h3>`);
				if (__props.post.comments.length === 0) _push(`<div class="no-comments" data-v-bc713e03><p data-v-bc713e03>Комментариев пока нет. Будьте первым!</p></div>`);
				else {
					_push(`<div class="comments" data-v-bc713e03><!--[-->`);
					ssrRenderList(__props.post.comments, (comment) => {
						_push(`<div class="comment" data-v-bc713e03><div class="comment-header" data-v-bc713e03>`);
						_push(ssrRenderComponent(unref(Link), {
							href: comment.user.profile_url,
							class: "comment-author"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									if (comment.user.avatar_url) _push(`<img${ssrRenderAttr("src", comment.user.avatar_url)} class="comment-avatar"${ssrRenderAttr("alt", comment.user.name)} data-v-bc713e03${_scopeId}>`);
									else _push(`<img src="/images/User-avatar.png" class="comment-avatar"${ssrRenderAttr("alt", comment.user.name)} data-v-bc713e03${_scopeId}>`);
									_push(`<span class="comment-author-name" data-v-bc713e03${_scopeId}>${ssrInterpolate(comment.user.name)}</span>`);
								} else return [comment.user.avatar_url ? (openBlock(), createBlock("img", {
									key: 0,
									src: comment.user.avatar_url,
									class: "comment-avatar",
									alt: comment.user.name
								}, null, 8, ["src", "alt"])) : (openBlock(), createBlock("img", {
									key: 1,
									src: "/images/User-avatar.png",
									class: "comment-avatar",
									alt: comment.user.name
								}, null, 8, ["alt"])), createVNode("span", { class: "comment-author-name" }, toDisplayString(comment.user.name), 1)];
							}),
							_: 2
						}, _parent));
						_push(`<small class="comment-date" data-v-bc713e03>${ssrInterpolate(formatDate(comment.created_at))}</small></div><div class="comment-body" data-v-bc713e03><p data-v-bc713e03>${ssrInterpolate(comment.text)}</p></div></div>`);
					});
					_push(`<!--]--></div>`);
				}
				_push(`<!--]-->`);
			} else if (activeTab.value === "applications") {
				_push(`<!--[--><h3 data-v-bc713e03>Список откликнувшихся (${ssrInterpolate(__props.post.vacancy.applications?.length || 0)})</h3>`);
				if (!__props.post.vacancy.applications || __props.post.vacancy.applications.length === 0) _push(`<div class="no-comments" data-v-bc713e03><p data-v-bc713e03>На эту вакансию пока никто не откликнулся.</p></div>`);
				else {
					_push(`<div class="comments" data-v-bc713e03><!--[-->`);
					ssrRenderList(__props.post.vacancy.applications, (application) => {
						_push(`<div class="comment" data-v-bc713e03><div class="comment-header" data-v-bc713e03>`);
						_push(ssrRenderComponent(unref(Link), {
							href: application.user.profile_url,
							class: "comment-author"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									if (application.user.avatar_url) _push(`<img${ssrRenderAttr("src", application.user.avatar_url)} class="comment-avatar"${ssrRenderAttr("alt", application.user.name)} data-v-bc713e03${_scopeId}>`);
									else _push(`<img src="/images/User-avatar.png" class="comment-avatar"${ssrRenderAttr("alt", application.user.name)} data-v-bc713e03${_scopeId}>`);
									_push(`<span class="comment-author-name" data-v-bc713e03${_scopeId}>${ssrInterpolate(application.user.name)}</span>`);
								} else return [application.user.avatar_url ? (openBlock(), createBlock("img", {
									key: 0,
									src: application.user.avatar_url,
									class: "comment-avatar",
									alt: application.user.name
								}, null, 8, ["src", "alt"])) : (openBlock(), createBlock("img", {
									key: 1,
									src: "/images/User-avatar.png",
									class: "comment-avatar",
									alt: application.user.name
								}, null, 8, ["alt"])), createVNode("span", { class: "comment-author-name" }, toDisplayString(application.user.name), 1)];
							}),
							_: 2
						}, _parent));
						_push(`<div class="comment-header-right" data-v-bc713e03><small class="comment-date" data-v-bc713e03>${ssrInterpolate(formatDate(application.created_at))}</small></div></div><div class="comment-body" data-v-bc713e03><div data-v-bc713e03>`);
						if (application.cover_letter) _push(`<p data-v-bc713e03>${ssrInterpolate(application.cover_letter)}</p>`);
						else _push(`<!---->`);
						if (application.proposed_price) _push(`<p class="proposed-price" data-v-bc713e03>Предложенная цена: ${ssrInterpolate(application.proposed_price)} ₽</p>`);
						else _push(`<!---->`);
						_push(`</div>`);
						if (application.chat_url) _push(ssrRenderComponent(unref(Link), {
							href: application.chat_url,
							class: "chat-btn"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Открыть чат `);
								else return [createTextVNode(" Открыть чат ")];
							}),
							_: 2
						}, _parent));
						else _push(`<!---->`);
						_push(`</div></div>`);
					});
					_push(`<!--]--></div>`);
				}
				_push(`<!--]-->`);
			} else _push(`<!---->`);
			_push(`</div></div>`);
			if (showRespondModal.value) {
				_push(`<div class="modal-overlay" data-v-bc713e03><div class="modal-content" data-v-bc713e03><button class="modal-close" data-v-bc713e03>×</button><h2 data-v-bc713e03>Отклик на вакансию</h2><form data-v-bc713e03><div class="form-group" data-v-bc713e03><label for="cover_letter" data-v-bc713e03>Сопроводительное письмо *</label><textarea id="cover_letter" required placeholder="Расскажите о себе и почему вы подходите на эту вакансию..." rows="6" data-v-bc713e03>${ssrInterpolate(unref(respondForm).cover_letter)}</textarea>`);
				if (unref(respondForm).errors.cover_letter) _push(`<div class="error" data-v-bc713e03>${ssrInterpolate(unref(respondForm).errors.cover_letter)}</div>`);
				else _push(`<!---->`);
				_push(`</div><div class="form-group" data-v-bc713e03><label for="proposed_price" data-v-bc713e03>Предложенная цена (₽)</label><input type="number" id="proposed_price"${ssrRenderAttr("value", unref(respondForm).proposed_price)} min="1" max="9999999999" placeholder="Ваша цена" data-v-bc713e03>`);
				if (unref(respondForm).errors.proposed_price) _push(`<div class="error" data-v-bc713e03>${ssrInterpolate(unref(respondForm).errors.proposed_price)}</div>`);
				else _push(`<!---->`);
				_push(`</div><button type="submit" class="submit-btn"${ssrIncludeBooleanAttr(unref(respondForm).processing) ? " disabled" : ""} data-v-bc713e03>${ssrInterpolate(unref(respondForm).processing ? "Отправка..." : "Отправить отклик")}</button></form></div></div>`);
			} else _push(`<!---->`);
			if (showReportModal.value) {
				_push(`<div class="modal-overlay" data-v-bc713e03><div class="modal-content" data-v-bc713e03><button class="modal-close" data-v-bc713e03>×</button><h2 data-v-bc713e03>Пожаловаться на пост</h2><form data-v-bc713e03><div class="form-group" data-v-bc713e03><label for="report_reason" data-v-bc713e03>Причина жалобы *</label><textarea id="report_reason" required placeholder="Опишите причину жалобы..." rows="4" data-v-bc713e03>${ssrInterpolate(unref(reportForm).reason)}</textarea>`);
				if (reportErrors.value.reason) _push(`<div class="error" data-v-bc713e03>${ssrInterpolate(reportErrors.value.reason)}</div>`);
				else _push(`<!---->`);
				_push(`</div><button type="submit" class="submit-btn"${ssrIncludeBooleanAttr(unref(reportForm).processing) ? " disabled" : ""} data-v-bc713e03>${ssrInterpolate(unref(reportForm).processing ? "Отправка..." : "Отправить жалобу")}</button></form></div></div>`);
			} else _push(`<!---->`);
			if (showShareModal.value) {
				_push(`<div class="modal-overlay" data-v-bc713e03><div class="modal-content" data-v-bc713e03><button class="modal-close" data-v-bc713e03>×</button><h2 data-v-bc713e03>Поделиться постом</h2><form data-v-bc713e03><div class="form-group" data-v-bc713e03><label data-v-bc713e03>Выберите чаты для отправки *</label>`);
				if (sharedChats.value.length === 0) _push(`<div class="no-chats" data-v-bc713e03><p data-v-bc713e03>У вас нет чатов для отправки поста.</p></div>`);
				else {
					_push(`<div class="chat-list" data-v-bc713e03><!--[-->`);
					ssrRenderList(sharedChats.value, (chat) => {
						_push(`<div class="chat-item" data-v-bc713e03><label class="chat-label" data-v-bc713e03><input type="checkbox"${ssrRenderAttr("value", chat.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(shareForm).users) ? ssrLooseContain(unref(shareForm).users, chat.id) : unref(shareForm).users) ? " checked" : ""} data-v-bc713e03><span class="chat-info" data-v-bc713e03>`);
						if (chat.other_user && chat.other_user.avatar_url) _push(`<img${ssrRenderAttr("src", chat.other_user.avatar_url)} class="chat-avatar"${ssrRenderAttr("alt", chat.other_user.name)} data-v-bc713e03>`);
						else _push(`<img src="/images/User-avatar.png" class="chat-avatar"${ssrRenderAttr("alt", chat.other_user ? chat.other_user.name : "Неизвестный пользователь")} data-v-bc713e03>`);
						_push(`<span class="chat-name" data-v-bc713e03>${ssrInterpolate(chat.other_user ? chat.other_user.name : "Неизвестный пользователь")}</span></span></label></div>`);
					});
					_push(`<!--]--></div>`);
				}
				if (shareErrors.value.users) _push(`<div class="error" data-v-bc713e03>${ssrInterpolate(shareErrors.value.users)}</div>`);
				else _push(`<!---->`);
				_push(`</div><div class="form-group" data-v-bc713e03><label for="share_message" data-v-bc713e03>Текст сообщения</label><textarea id="share_message" placeholder="Напишите сообщение к посту..." rows="4" data-v-bc713e03>${ssrInterpolate(unref(shareForm).message)}</textarea></div><button type="submit" class="submit-btn"${ssrIncludeBooleanAttr(unref(shareForm).processing) ? " disabled" : ""} data-v-bc713e03>${ssrInterpolate(unref(shareForm).processing ? "Отправка..." : "Отправить")}</button></form></div></div>`);
			} else _push(`<!---->`);
			_push(`</div>`);
		};
	}
});
var _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Posts/Show.vue");
	return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
var Show_default$1 = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$8, [["__scopeId", "data-v-bc713e03"]]);
//#endregion
//#region resources/js/Pages/Profile/Edit.vue
var Edit_exports = /* @__PURE__ */ __exportAll({ default: () => Edit_default });
var maxLength$1 = 1e3;
var warningThreshold$1 = 50;
var _sfc_main$7 = {
	__name: "Edit",
	__ssrInlineRender: true,
	props: {
		user: Object,
		skills: {
			type: Array,
			default: () => []
		}
	},
	setup(__props) {
		const props = __props;
		useDarkMode();
		const avatarPreview = ref(null);
		const form = useForm({
			name: props.user.name,
			aboutme: props.user.aboutme || "",
			avatar: null,
			skills: props.user.skills || [],
			_method: "PUT"
		});
		const currentLength = computed(() => (form.aboutme || "").length);
		const remainingChars = computed(() => maxLength$1 - currentLength.value);
		const pluralizeChars = (count) => {
			if (count === 1) return "символ";
			if (count >= 2 && count <= 4) return "символа";
			return "символов";
		};
		const handleAvatarChange = (e) => {
			const file = e.target.files[0];
			if (file) {
				form.avatar = file;
				const reader = new FileReader();
				reader.onload = (e) => {
					avatarPreview.value = e.target.result;
				};
				reader.readAsDataURL(file);
			}
		};
		function submit() {
			if (!form.avatar) form.transform((data) => {
				delete data.avatar;
				return data;
			});
			form.post(`/profile/${props.user.id}`, {
				forceFormData: true,
				preserveScroll: true,
				onSuccess: () => {
					if (form.avatar) {
						form.reset("avatar");
						avatarPreview.value = null;
					}
				}
			});
		}
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(AppLayout_default, _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(unref(Head), { title: "Редактирование профиля " + __props.user.name }, null, _parent, _scopeId));
						_push(`<div class="editblock" data-v-c8bb7bc4${_scopeId}><div class="edit-container" data-v-c8bb7bc4${_scopeId}><div class="back-link" data-v-c8bb7bc4${_scopeId}>`);
						_push(ssrRenderComponent(unref(Link), { href: "/profile/" + __props.user.id }, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`← Вернуться в профиль`);
								else return [createTextVNode("← Вернуться в профиль")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div><div class="edit-content" data-v-c8bb7bc4${_scopeId}><div class="avatar" data-v-c8bb7bc4${_scopeId}><div class="profile-header" data-v-c8bb7bc4${_scopeId}>`);
						if (avatarPreview.value) _push(`<img${ssrRenderAttr("src", avatarPreview.value)}${ssrRenderAttr("alt", "Аватарка " + unref(form).name)} data-v-c8bb7bc4${_scopeId}>`);
						else if (__props.user.avatar_url) _push(`<img${ssrRenderAttr("src", __props.user.avatar_url)}${ssrRenderAttr("alt", "Аватарка " + __props.user.name)} data-v-c8bb7bc4${_scopeId}>`);
						else _push(`<img src="/images/User-avatar.png" alt="Аватарка по умолчанию" data-v-c8bb7bc4${_scopeId}>`);
						_push(`</div></div><div class="desc" data-v-c8bb7bc4${_scopeId}><form enctype="multipart/form-data" data-v-c8bb7bc4${_scopeId}><div class="form-group" data-v-c8bb7bc4${_scopeId}><label for="name" data-v-c8bb7bc4${_scopeId}>Имя:</label><input type="text" name="name" id="name"${ssrRenderAttr("value", unref(form).name)} required data-v-c8bb7bc4${_scopeId}></div><div class="form-group" data-v-c8bb7bc4${_scopeId}><label for="avatar" data-v-c8bb7bc4${_scopeId}>Аватарка:</label><input type="file" name="avatar" id="avatar" accept="image/*" data-v-c8bb7bc4${_scopeId}></div><div class="form-group" data-v-c8bb7bc4${_scopeId}><label for="aboutme" data-v-c8bb7bc4${_scopeId}>О себе:</label><textarea name="aboutme" id="aboutme"${ssrRenderAttr("maxlength", maxLength$1)} data-v-c8bb7bc4${_scopeId}>${ssrInterpolate(unref(form).aboutme)}</textarea><div class="${ssrRenderClass([{ warning: remainingChars.value <= warningThreshold$1 }, "char-counter"])}" data-v-c8bb7bc4${_scopeId}>`);
						if (remainingChars.value <= warningThreshold$1) _push(`<span data-v-c8bb7bc4${_scopeId}> Осталось ${ssrInterpolate(remainingChars.value)} ${ssrInterpolate(pluralizeChars(remainingChars.value))}</span>`);
						else _push(`<span data-v-c8bb7bc4${_scopeId}>${ssrInterpolate(currentLength.value)} / ${ssrInterpolate(maxLength$1)}</span>`);
						_push(`</div></div><div class="form-group" data-v-c8bb7bc4${_scopeId}><label data-v-c8bb7bc4${_scopeId}>Ваши навыки:</label>`);
						_push(ssrRenderComponent(SkillsSelector_default, {
							skills: __props.skills,
							modelValue: unref(form).skills,
							"onUpdate:modelValue": ($event) => unref(form).skills = $event
						}, null, _parent, _scopeId));
						_push(`</div><div class="form-actions" data-v-c8bb7bc4${_scopeId}><button type="submit" class="btn-save"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""} data-v-c8bb7bc4${_scopeId}>${ssrInterpolate(unref(form).processing ? "Сохранение..." : "Сохранить изменения")}</button>`);
						_push(ssrRenderComponent(unref(Link), {
							href: "/profile/" + __props.user.id,
							class: "btn-cancel"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Отмена `);
								else return [createTextVNode(" Отмена ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div></form></div></div></div></div>`);
					} else return [createVNode(unref(Head), { title: "Редактирование профиля " + __props.user.name }, null, 8, ["title"]), createVNode("div", { class: "editblock" }, [createVNode("div", { class: "edit-container" }, [createVNode("div", { class: "back-link" }, [createVNode(unref(Link), { href: "/profile/" + __props.user.id }, {
						default: withCtx(() => [createTextVNode("← Вернуться в профиль")]),
						_: 1
					}, 8, ["href"])]), createVNode("div", { class: "edit-content" }, [createVNode("div", { class: "avatar" }, [createVNode("div", { class: "profile-header" }, [avatarPreview.value ? (openBlock(), createBlock("img", {
						key: 0,
						src: avatarPreview.value,
						alt: "Аватарка " + unref(form).name
					}, null, 8, ["src", "alt"])) : __props.user.avatar_url ? (openBlock(), createBlock("img", {
						key: 1,
						src: __props.user.avatar_url,
						alt: "Аватарка " + __props.user.name
					}, null, 8, ["src", "alt"])) : (openBlock(), createBlock("img", {
						key: 2,
						src: "/images/User-avatar.png",
						alt: "Аватарка по умолчанию"
					}))])]), createVNode("div", { class: "desc" }, [createVNode("form", {
						onSubmit: withModifiers(submit, ["prevent"]),
						enctype: "multipart/form-data"
					}, [
						createVNode("div", { class: "form-group" }, [createVNode("label", { for: "name" }, "Имя:"), withDirectives(createVNode("input", {
							type: "text",
							name: "name",
							id: "name",
							"onUpdate:modelValue": ($event) => unref(form).name = $event,
							required: ""
						}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).name]])]),
						createVNode("div", { class: "form-group" }, [createVNode("label", { for: "avatar" }, "Аватарка:"), createVNode("input", {
							type: "file",
							name: "avatar",
							id: "avatar",
							accept: "image/*",
							onChange: handleAvatarChange
						}, null, 32)]),
						createVNode("div", { class: "form-group" }, [
							createVNode("label", { for: "aboutme" }, "О себе:"),
							withDirectives(createVNode("textarea", {
								name: "aboutme",
								id: "aboutme",
								"onUpdate:modelValue": ($event) => unref(form).aboutme = $event,
								maxlength: maxLength$1
							}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).aboutme]]),
							createVNode("div", { class: ["char-counter", { warning: remainingChars.value <= warningThreshold$1 }] }, [remainingChars.value <= warningThreshold$1 ? (openBlock(), createBlock("span", { key: 0 }, " Осталось " + toDisplayString(remainingChars.value) + " " + toDisplayString(pluralizeChars(remainingChars.value)), 1)) : (openBlock(), createBlock("span", { key: 1 }, toDisplayString(currentLength.value) + " / " + toDisplayString(maxLength$1), 1))], 2)
						]),
						createVNode("div", { class: "form-group" }, [createVNode("label", null, "Ваши навыки:"), createVNode(SkillsSelector_default, {
							skills: __props.skills,
							modelValue: unref(form).skills,
							"onUpdate:modelValue": ($event) => unref(form).skills = $event
						}, null, 8, [
							"skills",
							"modelValue",
							"onUpdate:modelValue"
						])]),
						createVNode("div", { class: "form-actions" }, [createVNode("button", {
							type: "submit",
							class: "btn-save",
							disabled: unref(form).processing
						}, toDisplayString(unref(form).processing ? "Сохранение..." : "Сохранить изменения"), 9, ["disabled"]), createVNode(unref(Link), {
							href: "/profile/" + __props.user.id,
							class: "btn-cancel"
						}, {
							default: withCtx(() => [createTextVNode(" Отмена ")]),
							_: 1
						}, 8, ["href"])])
					], 32)])])])])];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Profile/Edit.vue");
	return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
var Edit_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$7, [["__scopeId", "data-v-c8bb7bc4"]]);
//#endregion
//#region resources/js/Pages/Profile/Followers.vue
var Followers_exports = /* @__PURE__ */ __exportAll({ default: () => Followers_default });
var _sfc_main$6 = {
	__name: "Followers",
	__ssrInlineRender: true,
	props: {
		user: Object,
		followers: Object
	},
	setup(__props) {
		useDarkMode();
		const page = usePage();
		const auth = computed(() => page.props.auth);
		const subscribe = (userId) => {
			router.post(`/profile/${userId}/subscribe`, {}, { preserveScroll: true });
		};
		const unsubscribe = (userId) => {
			router.delete(route("unsubscribe", userId), { preserveScroll: true });
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(AppLayout_default, _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(unref(Head), { title: `Подписчики ${__props.user.name}` }, null, _parent, _scopeId));
						_push(`<div class="following" data-v-3c234d08${_scopeId}><div class="back" data-v-3c234d08${_scopeId}><h1 data-v-3c234d08${_scopeId}>Подписчики ${ssrInterpolate(__props.user.name)}</h1>`);
						_push(ssrRenderComponent(unref(Link), { href: "/profile/" + __props.user.id }, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`← Вернуться в профиль`);
								else return [createTextVNode("← Вернуться в профиль")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div><!--[-->`);
						ssrRenderList(__props.followers.data, (follower) => {
							_push(`<div class="user" data-v-3c234d08${_scopeId}>`);
							_push(ssrRenderComponent(unref(Link), { href: "/profile/" + follower.id }, {
								default: withCtx((_, _push, _parent, _scopeId) => {
									if (_push) _push(`<img${ssrRenderAttr("src", follower.avatar ? `/storage/${follower.avatar}` : "/images/User-avatar.png")} class="author-avatar"${ssrRenderAttr("alt", `Аватар ${follower.name}`)} data-v-3c234d08${_scopeId}> ${ssrInterpolate(follower.name)}`);
									else return [createVNode("img", {
										src: follower.avatar ? `/storage/${follower.avatar}` : "/images/User-avatar.png",
										class: "author-avatar",
										alt: `Аватар ${follower.name}`
									}, null, 8, ["src", "alt"]), createTextVNode(" " + toDisplayString(follower.name), 1)];
								}),
								_: 2
							}, _parent, _scopeId));
							if (auth.value.user && follower.id !== auth.value.user.id) {
								_push(`<div data-v-3c234d08${_scopeId}>`);
								if (follower.is_mutual) _push(ssrRenderComponent(unref(Link), { href: `/chats/start/${follower.id}` }, {
									default: withCtx((_, _push, _parent, _scopeId) => {
										if (_push) _push(`<button type="button" class="btn-message" data-v-3c234d08${_scopeId}>Написать сообщение</button>`);
										else return [createVNode("button", {
											type: "button",
											class: "btn-message"
										}, "Написать сообщение")];
									}),
									_: 2
								}, _parent, _scopeId));
								else if (follower.is_subscribed) _push(`<form data-v-3c234d08${_scopeId}><button type="submit" class="btn-unsubscribe" data-v-3c234d08${_scopeId}>Отписаться</button></form>`);
								else _push(`<form data-v-3c234d08${_scopeId}><button type="submit" class="btn-subscribe" data-v-3c234d08${_scopeId}>Подписаться</button></form>`);
								_push(`</div>`);
							} else _push(`<!---->`);
							_push(`</div>`);
						});
						_push(`<!--]--></div>`);
					} else return [createVNode(unref(Head), { title: `Подписчики ${__props.user.name}` }, null, 8, ["title"]), createVNode("div", { class: "following" }, [createVNode("div", { class: "back" }, [createVNode("h1", null, "Подписчики " + toDisplayString(__props.user.name), 1), createVNode(unref(Link), { href: "/profile/" + __props.user.id }, {
						default: withCtx(() => [createTextVNode("← Вернуться в профиль")]),
						_: 1
					}, 8, ["href"])]), (openBlock(true), createBlock(Fragment, null, renderList(__props.followers.data, (follower) => {
						return openBlock(), createBlock("div", {
							key: follower.id,
							class: "user"
						}, [createVNode(unref(Link), { href: "/profile/" + follower.id }, {
							default: withCtx(() => [createVNode("img", {
								src: follower.avatar ? `/storage/${follower.avatar}` : "/images/User-avatar.png",
								class: "author-avatar",
								alt: `Аватар ${follower.name}`
							}, null, 8, ["src", "alt"]), createTextVNode(" " + toDisplayString(follower.name), 1)]),
							_: 2
						}, 1032, ["href"]), auth.value.user && follower.id !== auth.value.user.id ? (openBlock(), createBlock("div", { key: 0 }, [follower.is_mutual ? (openBlock(), createBlock(unref(Link), {
							key: 0,
							href: `/chats/start/${follower.id}`
						}, {
							default: withCtx(() => [createVNode("button", {
								type: "button",
								class: "btn-message"
							}, "Написать сообщение")]),
							_: 1
						}, 8, ["href"])) : follower.is_subscribed ? (openBlock(), createBlock("form", {
							key: 1,
							onSubmit: withModifiers(($event) => unsubscribe(follower.id), ["prevent"])
						}, [createVNode("button", {
							type: "submit",
							class: "btn-unsubscribe"
						}, "Отписаться")], 40, ["onSubmit"])) : (openBlock(), createBlock("form", {
							key: 2,
							onSubmit: withModifiers(($event) => subscribe(follower.id), ["prevent"])
						}, [createVNode("button", {
							type: "submit",
							class: "btn-subscribe"
						}, "Подписаться")], 40, ["onSubmit"]))])) : createCommentVNode("", true)]);
					}), 128))])];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Profile/Followers.vue");
	return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
var Followers_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$6, [["__scopeId", "data-v-3c234d08"]]);
//#endregion
//#region resources/js/Pages/Profile/Following.vue
var Following_exports = /* @__PURE__ */ __exportAll({ default: () => Following_default });
var _sfc_main$5 = {
	__name: "Following",
	__ssrInlineRender: true,
	props: {
		user: Object,
		following: Object,
		subscription: Object
	},
	setup(__props) {
		useDarkMode();
		const unsubscribe = (userId) => {
			router.delete(`/profile/${userId}/unsubscribe`, { preserveScroll: true });
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(AppLayout_default, _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(unref(Head), { title: `Подписки ${__props.user.name}` }, null, _parent, _scopeId));
						_push(`<div class="following" data-v-21f4d56d${_scopeId}><div class="back" data-v-21f4d56d${_scopeId}><h1 data-v-21f4d56d${_scopeId}>Подписки ${ssrInterpolate(__props.user.name)}</h1>`);
						_push(ssrRenderComponent(unref(Link), { href: "/profile/" + __props.user.id }, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`← Вернуться в профиль`);
								else return [createTextVNode("← Вернуться в профиль")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div><!--[-->`);
						ssrRenderList(__props.following.data, (subscription) => {
							_push(`<div class="user" data-v-21f4d56d${_scopeId}>`);
							_push(ssrRenderComponent(unref(Link), { href: "/profile/" + subscription.id }, {
								default: withCtx((_, _push, _parent, _scopeId) => {
									if (_push) _push(`<img${ssrRenderAttr("src", subscription.avatar ? `/storage/${subscription.avatar}` : "/images/User-avatar.png")} class="author-avatar"${ssrRenderAttr("alt", `Аватар ${subscription.name}`)} data-v-21f4d56d${_scopeId}> ${ssrInterpolate(subscription.name)}`);
									else return [createVNode("img", {
										src: subscription.avatar ? `/storage/${subscription.avatar}` : "/images/User-avatar.png",
										class: "author-avatar",
										alt: `Аватар ${subscription.name}`
									}, null, 8, ["src", "alt"]), createTextVNode(" " + toDisplayString(subscription.name), 1)];
								}),
								_: 2
							}, _parent, _scopeId));
							_push(`<form data-v-21f4d56d${_scopeId}><button type="submit" data-v-21f4d56d${_scopeId}>Отписаться</button></form></div>`);
						});
						_push(`<!--]--></div>`);
					} else return [createVNode(unref(Head), { title: `Подписки ${__props.user.name}` }, null, 8, ["title"]), createVNode("div", { class: "following" }, [createVNode("div", { class: "back" }, [createVNode("h1", null, "Подписки " + toDisplayString(__props.user.name), 1), createVNode(unref(Link), { href: "/profile/" + __props.user.id }, {
						default: withCtx(() => [createTextVNode("← Вернуться в профиль")]),
						_: 1
					}, 8, ["href"])]), (openBlock(true), createBlock(Fragment, null, renderList(__props.following.data, (subscription) => {
						return openBlock(), createBlock("div", {
							key: subscription.id,
							class: "user"
						}, [createVNode(unref(Link), { href: "/profile/" + subscription.id }, {
							default: withCtx(() => [createVNode("img", {
								src: subscription.avatar ? `/storage/${subscription.avatar}` : "/images/User-avatar.png",
								class: "author-avatar",
								alt: `Аватар ${subscription.name}`
							}, null, 8, ["src", "alt"]), createTextVNode(" " + toDisplayString(subscription.name), 1)]),
							_: 2
						}, 1032, ["href"]), createVNode("form", { onSubmit: withModifiers(($event) => unsubscribe(subscription.id), ["prevent"]) }, [createVNode("button", { type: "submit" }, "Отписаться")], 40, ["onSubmit"])]);
					}), 128))])];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Profile/Following.vue");
	return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
var Following_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$5, [["__scopeId", "data-v-21f4d56d"]]);
//#endregion
//#region resources/js/Pages/Profile/LikedPosts.vue
var LikedPosts_exports = /* @__PURE__ */ __exportAll({ default: () => LikedPosts_default });
var _sfc_main$4 = {
	__name: "LikedPosts",
	__ssrInlineRender: true,
	props: {
		user: Object,
		likedPosts: Array
	},
	setup(__props) {
		useDarkMode();
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(AppLayout_default, _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(unref(Head), { title: `Понравившиеся посты ${__props.user.name}` }, null, _parent, _scopeId));
						_push(`<div class="likeshead" data-v-d775320c${_scopeId}><h1 data-v-d775320c${_scopeId}>Лайки ${ssrInterpolate(__props.user.name)}</h1>`);
						_push(ssrRenderComponent(unref(Link), { href: "/profile/" + __props.user.id }, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`← Вернуться в профиль`);
								else return [createTextVNode("← Вернуться в профиль")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div>`);
						if (__props.likedPosts.length === 0) _push(`<h1 class="noposts" data-v-d775320c${_scopeId}> У ${ssrInterpolate(__props.user.name)} пока что нет понравившихся постов... </h1>`);
						else {
							_push(`<div class="posts" data-v-d775320c${_scopeId}><!--[-->`);
							ssrRenderList(__props.likedPosts, (like) => {
								_push(ssrRenderComponent(Post_default, {
									key: like.id,
									post: like.post,
									url: `/posts/${like.post.id}`
								}, null, _parent, _scopeId));
							});
							_push(`<!--]--></div>`);
						}
					} else return [
						createVNode(unref(Head), { title: `Понравившиеся посты ${__props.user.name}` }, null, 8, ["title"]),
						createVNode("div", { class: "likeshead" }, [createVNode("h1", null, "Лайки " + toDisplayString(__props.user.name), 1), createVNode(unref(Link), { href: "/profile/" + __props.user.id }, {
							default: withCtx(() => [createTextVNode("← Вернуться в профиль")]),
							_: 1
						}, 8, ["href"])]),
						__props.likedPosts.length === 0 ? (openBlock(), createBlock("h1", {
							key: 0,
							class: "noposts"
						}, " У " + toDisplayString(__props.user.name) + " пока что нет понравившихся постов... ", 1)) : (openBlock(), createBlock("div", {
							key: 1,
							class: "posts"
						}, [(openBlock(true), createBlock(Fragment, null, renderList(__props.likedPosts, (like) => {
							return openBlock(), createBlock(Post_default, {
								key: like.id,
								post: like.post,
								url: `/posts/${like.post.id}`
							}, null, 8, ["post", "url"]);
						}), 128))]))
					];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Profile/LikedPosts.vue");
	return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
var LikedPosts_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$4, [["__scopeId", "data-v-d775320c"]]);
//#endregion
//#region resources/js/Pages/Profile/Ratings.vue
var Ratings_exports = /* @__PURE__ */ __exportAll({ default: () => Ratings_default });
var _sfc_main$3 = {
	__name: "Ratings",
	__ssrInlineRender: true,
	props: {
		user: Object,
		reviews: Object,
		averageRating: [Number, String],
		reviewsCount: Number
	},
	setup(__props) {
		useDarkMode();
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(AppLayout_default, _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(unref(Head), { title: `Рейтинг ${__props.user.name}` }, null, _parent, _scopeId));
						_push(`<div class="ratings-page" data-v-addca7cf${_scopeId}><div class="back" data-v-addca7cf${_scopeId}>`);
						_push(ssrRenderComponent(unref(Link), { href: "/profile/" + __props.user.id }, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`← Вернуться в профиль`);
								else return [createTextVNode("← Вернуться в профиль")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div><div class="rating-header" data-v-addca7cf${_scopeId}><img${ssrRenderAttr("src", __props.user.avatar ? "/storage/" + __props.user.avatar : "/images/User-avatar.png")} class="author-avatar"${ssrRenderAttr("alt", `Аватар ${__props.user.name}`)} data-v-addca7cf${_scopeId}><div class="rating-info" data-v-addca7cf${_scopeId}><h1 data-v-addca7cf${_scopeId}>Рейтинг ${ssrInterpolate(__props.user.name)}</h1><div class="average-rating" data-v-addca7cf${_scopeId}><span class="stars" data-v-addca7cf${_scopeId}>${ssrInterpolate("★".repeat(Math.round(__props.averageRating || 0)))}</span><span class="rating-number" data-v-addca7cf${_scopeId}>${ssrInterpolate(__props.averageRating || "0.00")}</span><span class="reviews-count" data-v-addca7cf${_scopeId}>(${ssrInterpolate(__props.reviewsCount)} отзывов)</span></div></div></div><div class="reviews-list" data-v-addca7cf${_scopeId}><h2 data-v-addca7cf${_scopeId}>Отзывы</h2>`);
						if (__props.reviews.length === 0) _push(`<div class="no-reviews" data-v-addca7cf${_scopeId}><p data-v-addca7cf${_scopeId}>Пока нет отзывов</p></div>`);
						else _push(`<!---->`);
						_push(`<!--[-->`);
						ssrRenderList(__props.reviews, (review) => {
							_push(`<div class="review" data-v-addca7cf${_scopeId}><div class="review-header" data-v-addca7cf${_scopeId}>`);
							_push(ssrRenderComponent(unref(Link), { href: review.reviewer.profile_url }, {
								default: withCtx((_, _push, _parent, _scopeId) => {
									if (_push) _push(`<img${ssrRenderAttr("src", review.reviewer.avatar_url ? review.reviewer.avatar_url : "/images/User-avatar.png")} class="reviewer-avatar"${ssrRenderAttr("alt", `Аватар ${review.reviewer.name}`)} data-v-addca7cf${_scopeId}><span class="reviewer-name" data-v-addca7cf${_scopeId}>${ssrInterpolate(review.reviewer.name)}</span>`);
									else return [createVNode("img", {
										src: review.reviewer.avatar_url ? review.reviewer.avatar_url : "/images/User-avatar.png",
										class: "reviewer-avatar",
										alt: `Аватар ${review.reviewer.name}`
									}, null, 8, ["src", "alt"]), createVNode("span", { class: "reviewer-name" }, toDisplayString(review.reviewer.name), 1)];
								}),
								_: 2
							}, _parent, _scopeId));
							_push(`<span class="review-rating" data-v-addca7cf${_scopeId}>${ssrInterpolate("★".repeat(review.rating))}</span></div>`);
							if (review.comment) _push(`<p class="review-comment" data-v-addca7cf${_scopeId}>${ssrInterpolate(review.comment)}</p>`);
							else _push(`<!---->`);
							_push(`<span class="review-date" data-v-addca7cf${_scopeId}>${ssrInterpolate(new Date(review.created_at).toLocaleDateString("ru-RU"))}</span></div>`);
						});
						_push(`<!--]--></div></div>`);
					} else return [createVNode(unref(Head), { title: `Рейтинг ${__props.user.name}` }, null, 8, ["title"]), createVNode("div", { class: "ratings-page" }, [
						createVNode("div", { class: "back" }, [createVNode(unref(Link), { href: "/profile/" + __props.user.id }, {
							default: withCtx(() => [createTextVNode("← Вернуться в профиль")]),
							_: 1
						}, 8, ["href"])]),
						createVNode("div", { class: "rating-header" }, [createVNode("img", {
							src: __props.user.avatar ? "/storage/" + __props.user.avatar : "/images/User-avatar.png",
							class: "author-avatar",
							alt: `Аватар ${__props.user.name}`
						}, null, 8, ["src", "alt"]), createVNode("div", { class: "rating-info" }, [createVNode("h1", null, "Рейтинг " + toDisplayString(__props.user.name), 1), createVNode("div", { class: "average-rating" }, [
							createVNode("span", { class: "stars" }, toDisplayString("★".repeat(Math.round(__props.averageRating || 0))), 1),
							createVNode("span", { class: "rating-number" }, toDisplayString(__props.averageRating || "0.00"), 1),
							createVNode("span", { class: "reviews-count" }, "(" + toDisplayString(__props.reviewsCount) + " отзывов)", 1)
						])])]),
						createVNode("div", { class: "reviews-list" }, [
							createVNode("h2", null, "Отзывы"),
							__props.reviews.length === 0 ? (openBlock(), createBlock("div", {
								key: 0,
								class: "no-reviews"
							}, [createVNode("p", null, "Пока нет отзывов")])) : createCommentVNode("", true),
							(openBlock(true), createBlock(Fragment, null, renderList(__props.reviews, (review) => {
								return openBlock(), createBlock("div", {
									key: review.id,
									class: "review"
								}, [
									createVNode("div", { class: "review-header" }, [createVNode(unref(Link), { href: review.reviewer.profile_url }, {
										default: withCtx(() => [createVNode("img", {
											src: review.reviewer.avatar_url ? review.reviewer.avatar_url : "/images/User-avatar.png",
											class: "reviewer-avatar",
											alt: `Аватар ${review.reviewer.name}`
										}, null, 8, ["src", "alt"]), createVNode("span", { class: "reviewer-name" }, toDisplayString(review.reviewer.name), 1)]),
										_: 2
									}, 1032, ["href"]), createVNode("span", { class: "review-rating" }, toDisplayString("★".repeat(review.rating)), 1)]),
									review.comment ? (openBlock(), createBlock("p", {
										key: 0,
										class: "review-comment"
									}, toDisplayString(review.comment), 1)) : createCommentVNode("", true),
									createVNode("span", { class: "review-date" }, toDisplayString(new Date(review.created_at).toLocaleDateString("ru-RU")), 1)
								]);
							}), 128))
						])
					])];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Profile/Ratings.vue");
	return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
var Ratings_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$3, [["__scopeId", "data-v-addca7cf"]]);
//#endregion
//#region resources/js/Pages/Profile/Show.vue
var Show_exports = /* @__PURE__ */ __exportAll({ default: () => Show_default });
var _sfc_main$2 = {
	__name: "Show",
	__ssrInlineRender: true,
	props: {
		user: Object,
		posts: Object,
		auth: Object,
		closedVacancies: {
			type: Array,
			default: () => []
		},
		isOwnProfile: {
			type: Boolean,
			default: false
		}
	},
	setup(__props) {
		const props = __props;
		useDarkMode();
		const page = usePage();
		const auth = computed(() => page.props.auth);
		const isOwnProfile = computed(() => auth.value.user && auth.value.user.id === props.user.id);
		const aboutmeText = ref(null);
		const aboutmeContent = ref(null);
		const showExpandButton = ref(false);
		const isExpanded = ref(false);
		const expandedHeight = ref("15em");
		const checkTextHeight = () => {
			if (aboutmeText.value) {
				const lineHeight = parseFloat(getComputedStyle(aboutmeText.value).lineHeight);
				showExpandButton.value = aboutmeText.value.scrollHeight > lineHeight * 15;
			}
		};
		const toggleExpand = () => {
			if (!isExpanded.value) expandedHeight.value = aboutmeText.value.scrollHeight + "px";
			else expandedHeight.value = "15em";
			isExpanded.value = !isExpanded.value;
		};
		onMounted(() => {
			nextTick(() => {
				checkTextHeight();
			});
		});
		const aboutMeForm = useForm({ aboutme: props.user.aboutme || "" });
		const submitAboutMe = () => {
			aboutMeForm.put(route("profile.update-aboutme", props.user.username), {
				preserveScroll: true,
				onSuccess: () => {
					nextTick(() => {
						checkTextHeight();
					});
				}
			});
		};
		useForm({ avatar: null });
		const toggleSubscription = () => {
			if (!props.auth?.user) {
				router.visit("/login");
				return;
			}
			if (!props.user?.id) {
				console.error("ID пользователя не найден в props.user");
				return;
			}
			const url = `/profile/${props.user.id}/${props.user.is_subscribed ? "unsubscribe" : "subscribe"}`;
			router[props.user.is_subscribed ? "delete" : "post"](url, {}, {
				preserveScroll: true,
				preserveState: true
			});
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(AppLayout_default, _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(unref(Head), { title: "Профиль " + __props.user.name }, null, _parent, _scopeId));
						_push(`<div class="Profileblock" data-v-1a4d647a${_scopeId}><div class="container" data-v-1a4d647a${_scopeId}><div class="avatar" data-v-1a4d647a${_scopeId}><div class="profile-header" data-v-1a4d647a${_scopeId}>`);
						if (__props.user.avatar_url) _push(`<img${ssrRenderAttr("src", __props.user.avatar_url)}${ssrRenderAttr("alt", "Аватарка " + __props.user.name)} data-v-1a4d647a${_scopeId}>`);
						else _push(`<img src="/images/User-avatar.png"${ssrRenderAttr("alt", "Аватарка " + __props.user.name)} data-v-1a4d647a${_scopeId}>`);
						_push(`</div><div class="desc" data-v-1a4d647a${_scopeId}><h1 data-v-1a4d647a${_scopeId}>${ssrInterpolate(__props.user.name)}</h1>`);
						if (__props.user.is_verified === "verified") _push(`<img src="/images/verified.svg" alt="Аккаунт верифицирован" data-v-1a4d647a${_scopeId}>`);
						else _push(`<!---->`);
						_push(`</div>`);
						if (__props.user.rating) {
							_push(`<div class="rating-display" data-v-1a4d647a${_scopeId}>`);
							_push(ssrRenderComponent(unref(Link), {
								href: "/ratings/" + __props.user.id,
								class: "rating-link"
							}, {
								default: withCtx((_, _push, _parent, _scopeId) => {
									if (_push) {
										_push(`<div class="stars" data-v-1a4d647a${_scopeId}><!--[-->`);
										ssrRenderList(5, (i) => {
											_push(`<!--[-->`);
											if (i <= Math.floor(__props.user.rating)) _push(`<img src="/images/star.svg" alt="star" class="star-icon" data-v-1a4d647a${_scopeId}>`);
											else if (i - 1 < __props.user.rating && __props.user.rating % 1 >= .5) _push(`<img src="/images/star.svg" alt="half-star" class="star-icon half" data-v-1a4d647a${_scopeId}>`);
											else _push(`<img src="/images/star-empty.svg" alt="star-empty" class="star-icon empty" data-v-1a4d647a${_scopeId}>`);
											_push(`<!--]-->`);
										});
										_push(`<!--]--></div><span class="rating-value" data-v-1a4d647a${_scopeId}>${ssrInterpolate(__props.user.rating)}</span>`);
									} else return [createVNode("div", { class: "stars" }, [(openBlock(), createBlock(Fragment, null, renderList(5, (i) => {
										return openBlock(), createBlock(Fragment, { key: i }, [i <= Math.floor(__props.user.rating) ? (openBlock(), createBlock("img", {
											key: 0,
											src: "/images/star.svg",
											alt: "star",
											class: "star-icon"
										})) : i - 1 < __props.user.rating && __props.user.rating % 1 >= .5 ? (openBlock(), createBlock("img", {
											key: 1,
											src: "/images/star.svg",
											alt: "half-star",
											class: "star-icon half"
										})) : (openBlock(), createBlock("img", {
											key: 2,
											src: "/images/star-empty.svg",
											alt: "star-empty",
											class: "star-icon empty"
										}))], 64);
									}), 64))]), createVNode("span", { class: "rating-value" }, toDisplayString(__props.user.rating), 1)];
								}),
								_: 1
							}, _parent, _scopeId));
							_push(`</div>`);
						} else _push(`<!---->`);
						if (__props.user.created_at) _push(`<p class="created-at" data-v-1a4d647a${_scopeId}>Аккаунт создан ${ssrInterpolate(__props.user.created_at)}</p>`);
						else _push(`<!---->`);
						_push(`</div></div><div class="aboutme" data-v-1a4d647a${_scopeId}><div class="aboutme-header" data-v-1a4d647a${_scopeId}><h1 data-v-1a4d647a${_scopeId}>Обо мне</h1>`);
						_push(ssrRenderComponent(unref(Link), { href: "/profile/" + __props.user.id + "/following" }, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Подписки<br data-v-1a4d647a${_scopeId}> ${ssrInterpolate(__props.user.following_count)}`);
								else return [
									createTextVNode(" Подписки"),
									createVNode("br"),
									createTextVNode(" " + toDisplayString(__props.user.following_count), 1)
								];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(Link), { href: "/profile/" + __props.user.id + "/followers" }, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Подписчики<br data-v-1a4d647a${_scopeId}> ${ssrInterpolate(__props.user.followers_count)}`);
								else return [
									createTextVNode(" Подписчики"),
									createVNode("br"),
									createTextVNode(" " + toDisplayString(__props.user.followers_count), 1)
								];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(Link), { href: "/profile/" + __props.user.id + "/liked-posts" }, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`Лайки`);
								else return [createTextVNode("Лайки")];
							}),
							_: 1
						}, _parent, _scopeId));
						if (isOwnProfile.value) _push(ssrRenderComponent(unref(Link), {
							href: "/settings",
							class: "btn-edit"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`<img src="/images/settings.svg" alt="Редактировать профиль" data-v-1a4d647a${_scopeId}>`);
								else return [createVNode("img", {
									src: "/images/settings.svg",
									alt: "Редактировать профиль"
								})];
							}),
							_: 1
						}, _parent, _scopeId));
						else _push(`<!---->`);
						_push(`</div>`);
						if (isOwnProfile.value) {
							_push(`<div data-v-1a4d647a${_scopeId}>`);
							if (!__props.user.aboutme) _push(`<div class="aboutme-form" data-v-1a4d647a${_scopeId}><p data-v-1a4d647a${_scopeId}>Расскажите о себе</p><form data-v-1a4d647a${_scopeId}><textarea draggable="false" placeholder="Напишите что-нибудь о себе..." data-v-1a4d647a${_scopeId}>${ssrInterpolate(unref(aboutMeForm).aboutme)}</textarea><button type="submit"${ssrIncludeBooleanAttr(unref(aboutMeForm).processing) ? " disabled" : ""} data-v-1a4d647a${_scopeId}>Сохранить</button></form></div>`);
							else _push(`<div class="${ssrRenderClass([{ expanded: isExpanded.value }, "aboutme-content"])}" style="${ssrRenderStyle({ maxHeight: expandedHeight.value })}" data-v-1a4d647a${_scopeId}><p data-v-1a4d647a${_scopeId}>${ssrInterpolate(__props.user.aboutme)}</p></div>`);
							_push(`</div>`);
						} else _push(`<div class="aboutme-body" data-v-1a4d647a${_scopeId}><div class="${ssrRenderClass([{ expanded: isExpanded.value }, "aboutme-content"])}" style="${ssrRenderStyle({ maxHeight: expandedHeight.value })}" data-v-1a4d647a${_scopeId}><p class="truncated-text" data-v-1a4d647a${_scopeId}>${ssrInterpolate(__props.user.aboutme || "Пользователь пока не добавил информацию о себе.")}</p></div></div>`);
						if (showExpandButton.value) _push(`<div class="expand" data-v-1a4d647a${_scopeId}>${ssrInterpolate(isExpanded.value ? "Свернуть" : "Развернуть")}</div>`);
						else _push(`<!---->`);
						if (__props.user.skills && __props.user.skills.length > 0) {
							_push(`<div class="user-skills" data-v-1a4d647a${_scopeId}><h3 data-v-1a4d647a${_scopeId}>Навыки</h3><div class="skills-list" data-v-1a4d647a${_scopeId}><!--[-->`);
							ssrRenderList(__props.user.skills, (skill) => {
								_push(`<div class="${ssrRenderClass([unref(getSkillClass)(skill.name), "skill-tag"])}" data-v-1a4d647a${_scopeId}><span class="skill-name" data-v-1a4d647a${_scopeId}>${ssrInterpolate(skill.name)}</span><span class="skill-level" data-v-1a4d647a${_scopeId}>★ ${ssrInterpolate(skill.level)}</span></div>`);
							});
							_push(`<!--]--></div></div>`);
						} else _push(`<!---->`);
						if (!isOwnProfile.value && auth.value.user) {
							_push(`<div class="profile-actions" data-v-1a4d647a${_scopeId}><form data-v-1a4d647a${_scopeId}><button type="submit" data-v-1a4d647a${_scopeId}>${ssrInterpolate(__props.user.is_subscribed ? "Отписаться" : "Подписаться")}</button></form>`);
							_push(ssrRenderComponent(unref(Link), { href: "/chats/start/" + __props.user.id }, {
								default: withCtx((_, _push, _parent, _scopeId) => {
									if (_push) _push(`<button data-v-1a4d647a${_scopeId}>Написать сообщение</button>`);
									else return [createVNode("button", null, "Написать сообщение")];
								}),
								_: 1
							}, _parent, _scopeId));
							_push(`</div>`);
						} else _push(`<!---->`);
						_push(`</div></div><h2 data-v-1a4d647a${_scopeId}>Посты ${ssrInterpolate(__props.user.name)}</h2>`);
						if (__props.posts.length > 0 || isOwnProfile.value) {
							_push(`<div class="posts" data-v-1a4d647a${_scopeId}>`);
							if (isOwnProfile.value) {
								_push(`<div class="post add-post-block" data-v-1a4d647a${_scopeId}>`);
								_push(ssrRenderComponent(unref(Link), {
									href: "/posts/create",
									class: "add-post-link"
								}, {
									default: withCtx((_, _push, _parent, _scopeId) => {
										if (_push) _push(`<p data-v-1a4d647a${_scopeId}>Добавить новый пост</p><button class="add-post-button" data-v-1a4d647a${_scopeId}>+</button>`);
										else return [createVNode("p", null, "Добавить новый пост"), createVNode("button", { class: "add-post-button" }, "+")];
									}),
									_: 1
								}, _parent, _scopeId));
								_push(`</div>`);
							} else _push(`<!---->`);
							_push(`<!--[-->`);
							ssrRenderList(__props.posts, (post) => {
								_push(ssrRenderComponent(Post_default, {
									key: post.id,
									post
								}, null, _parent, _scopeId));
							});
							_push(`<!--]--></div>`);
						} else _push(`<div class="noposts" data-v-1a4d647a${_scopeId}><h1 data-v-1a4d647a${_scopeId}>у ${ssrInterpolate(__props.user.name)} пока что нет постов...</h1></div>`);
						if (isOwnProfile.value && __props.closedVacancies && __props.closedVacancies.length > 0) {
							_push(`<div class="closed-vacancies" data-v-1a4d647a${_scopeId}><h2 data-v-1a4d647a${_scopeId}>Завершённые вакансии</h2><div class="posts" data-v-1a4d647a${_scopeId}><!--[-->`);
							ssrRenderList(__props.closedVacancies, (post) => {
								_push(ssrRenderComponent(Post_default, {
									key: post.id,
									post
								}, null, _parent, _scopeId));
							});
							_push(`<!--]--></div></div>`);
						} else _push(`<!---->`);
					} else return [
						createVNode(unref(Head), { title: "Профиль " + __props.user.name }, null, 8, ["title"]),
						createVNode("div", { class: "Profileblock" }, [createVNode("div", { class: "container" }, [createVNode("div", { class: "avatar" }, [
							createVNode("div", { class: "profile-header" }, [__props.user.avatar_url ? (openBlock(), createBlock("img", {
								key: 0,
								src: __props.user.avatar_url,
								alt: "Аватарка " + __props.user.name
							}, null, 8, ["src", "alt"])) : (openBlock(), createBlock("img", {
								key: 1,
								src: "/images/User-avatar.png",
								alt: "Аватарка " + __props.user.name
							}, null, 8, ["alt"]))]),
							createVNode("div", { class: "desc" }, [createVNode("h1", null, toDisplayString(__props.user.name), 1), __props.user.is_verified === "verified" ? (openBlock(), createBlock("img", {
								key: 0,
								src: "/images/verified.svg",
								alt: "Аккаунт верифицирован"
							})) : createCommentVNode("", true)]),
							__props.user.rating ? (openBlock(), createBlock("div", {
								key: 0,
								class: "rating-display"
							}, [createVNode(unref(Link), {
								href: "/ratings/" + __props.user.id,
								class: "rating-link"
							}, {
								default: withCtx(() => [createVNode("div", { class: "stars" }, [(openBlock(), createBlock(Fragment, null, renderList(5, (i) => {
									return openBlock(), createBlock(Fragment, { key: i }, [i <= Math.floor(__props.user.rating) ? (openBlock(), createBlock("img", {
										key: 0,
										src: "/images/star.svg",
										alt: "star",
										class: "star-icon"
									})) : i - 1 < __props.user.rating && __props.user.rating % 1 >= .5 ? (openBlock(), createBlock("img", {
										key: 1,
										src: "/images/star.svg",
										alt: "half-star",
										class: "star-icon half"
									})) : (openBlock(), createBlock("img", {
										key: 2,
										src: "/images/star-empty.svg",
										alt: "star-empty",
										class: "star-icon empty"
									}))], 64);
								}), 64))]), createVNode("span", { class: "rating-value" }, toDisplayString(__props.user.rating), 1)]),
								_: 1
							}, 8, ["href"])])) : createCommentVNode("", true),
							__props.user.created_at ? (openBlock(), createBlock("p", {
								key: 1,
								class: "created-at"
							}, "Аккаунт создан " + toDisplayString(__props.user.created_at), 1)) : createCommentVNode("", true)
						])]), createVNode("div", { class: "aboutme" }, [
							createVNode("div", { class: "aboutme-header" }, [
								createVNode("h1", null, "Обо мне"),
								createVNode(unref(Link), { href: "/profile/" + __props.user.id + "/following" }, {
									default: withCtx(() => [
										createTextVNode(" Подписки"),
										createVNode("br"),
										createTextVNode(" " + toDisplayString(__props.user.following_count), 1)
									]),
									_: 1
								}, 8, ["href"]),
								createVNode(unref(Link), { href: "/profile/" + __props.user.id + "/followers" }, {
									default: withCtx(() => [
										createTextVNode(" Подписчики"),
										createVNode("br"),
										createTextVNode(" " + toDisplayString(__props.user.followers_count), 1)
									]),
									_: 1
								}, 8, ["href"]),
								createVNode(unref(Link), { href: "/profile/" + __props.user.id + "/liked-posts" }, {
									default: withCtx(() => [createTextVNode("Лайки")]),
									_: 1
								}, 8, ["href"]),
								isOwnProfile.value ? (openBlock(), createBlock(unref(Link), {
									key: 0,
									href: "/settings",
									class: "btn-edit"
								}, {
									default: withCtx(() => [createVNode("img", {
										src: "/images/settings.svg",
										alt: "Редактировать профиль"
									})]),
									_: 1
								})) : createCommentVNode("", true)
							]),
							isOwnProfile.value ? (openBlock(), createBlock("div", { key: 0 }, [!__props.user.aboutme ? (openBlock(), createBlock("div", {
								key: 0,
								class: "aboutme-form"
							}, [createVNode("p", null, "Расскажите о себе"), createVNode("form", { onSubmit: withModifiers(submitAboutMe, ["prevent"]) }, [withDirectives(createVNode("textarea", {
								draggable: "false",
								"onUpdate:modelValue": ($event) => unref(aboutMeForm).aboutme = $event,
								placeholder: "Напишите что-нибудь о себе..."
							}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(aboutMeForm).aboutme]]), createVNode("button", {
								type: "submit",
								disabled: unref(aboutMeForm).processing
							}, "Сохранить", 8, ["disabled"])], 32)])) : (openBlock(), createBlock("div", {
								key: 1,
								class: ["aboutme-content", { expanded: isExpanded.value }],
								style: { maxHeight: expandedHeight.value },
								ref_key: "aboutmeContent",
								ref: aboutmeContent
							}, [createVNode("p", {
								ref_key: "aboutmeText",
								ref: aboutmeText
							}, toDisplayString(__props.user.aboutme), 513)], 6))])) : (openBlock(), createBlock("div", {
								key: 1,
								class: "aboutme-body"
							}, [createVNode("div", {
								class: ["aboutme-content", { expanded: isExpanded.value }],
								style: { maxHeight: expandedHeight.value },
								ref_key: "aboutmeContent",
								ref: aboutmeContent
							}, [createVNode("p", {
								class: "truncated-text",
								ref_key: "aboutmeText",
								ref: aboutmeText
							}, toDisplayString(__props.user.aboutme || "Пользователь пока не добавил информацию о себе."), 513)], 6)])),
							showExpandButton.value ? (openBlock(), createBlock("div", {
								key: 2,
								onClick: toggleExpand,
								class: "expand"
							}, toDisplayString(isExpanded.value ? "Свернуть" : "Развернуть"), 1)) : createCommentVNode("", true),
							__props.user.skills && __props.user.skills.length > 0 ? (openBlock(), createBlock("div", {
								key: 3,
								class: "user-skills"
							}, [createVNode("h3", null, "Навыки"), createVNode("div", { class: "skills-list" }, [(openBlock(true), createBlock(Fragment, null, renderList(__props.user.skills, (skill) => {
								return openBlock(), createBlock("div", {
									key: skill.id,
									class: ["skill-tag", unref(getSkillClass)(skill.name)]
								}, [createVNode("span", { class: "skill-name" }, toDisplayString(skill.name), 1), createVNode("span", { class: "skill-level" }, "★ " + toDisplayString(skill.level), 1)], 2);
							}), 128))])])) : createCommentVNode("", true),
							!isOwnProfile.value && auth.value.user ? (openBlock(), createBlock("div", {
								key: 4,
								class: "profile-actions"
							}, [createVNode("form", { onSubmit: withModifiers(toggleSubscription, ["prevent"]) }, [createVNode("button", { type: "submit" }, toDisplayString(__props.user.is_subscribed ? "Отписаться" : "Подписаться"), 1)], 32), createVNode(unref(Link), { href: "/chats/start/" + __props.user.id }, {
								default: withCtx(() => [createVNode("button", null, "Написать сообщение")]),
								_: 1
							}, 8, ["href"])])) : createCommentVNode("", true)
						])]),
						createVNode("h2", null, "Посты " + toDisplayString(__props.user.name), 1),
						__props.posts.length > 0 || isOwnProfile.value ? (openBlock(), createBlock("div", {
							key: 0,
							class: "posts"
						}, [isOwnProfile.value ? (openBlock(), createBlock("div", {
							key: 0,
							class: "post add-post-block"
						}, [createVNode(unref(Link), {
							href: "/posts/create",
							class: "add-post-link"
						}, {
							default: withCtx(() => [createVNode("p", null, "Добавить новый пост"), createVNode("button", { class: "add-post-button" }, "+")]),
							_: 1
						})])) : createCommentVNode("", true), (openBlock(true), createBlock(Fragment, null, renderList(__props.posts, (post) => {
							return openBlock(), createBlock(Post_default, {
								key: post.id,
								post
							}, null, 8, ["post"]);
						}), 128))])) : (openBlock(), createBlock("div", {
							key: 1,
							class: "noposts"
						}, [createVNode("h1", null, "у " + toDisplayString(__props.user.name) + " пока что нет постов...", 1)])),
						isOwnProfile.value && __props.closedVacancies && __props.closedVacancies.length > 0 ? (openBlock(), createBlock("div", {
							key: 2,
							class: "closed-vacancies"
						}, [createVNode("h2", null, "Завершённые вакансии"), createVNode("div", { class: "posts" }, [(openBlock(true), createBlock(Fragment, null, renderList(__props.closedVacancies, (post) => {
							return openBlock(), createBlock(Post_default, {
								key: post.id,
								post
							}, null, 8, ["post"]);
						}), 128))])])) : createCommentVNode("", true)
					];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Profile/Show.vue");
	return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
var Show_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$2, [["__scopeId", "data-v-1a4d647a"]]);
//#endregion
//#region resources/js/Pages/Settings/Index.vue
var Index_exports = /* @__PURE__ */ __exportAll({ default: () => Index_default });
var maxLength = 1e3;
var warningThreshold = 50;
var _sfc_main$1 = {
	__name: "Index",
	__ssrInlineRender: true,
	props: {
		section: String,
		user: Object,
		skills: {
			type: Array,
			default: () => []
		},
		userSkills: {
			type: Array,
			default: () => []
		},
		userFiles: {
			type: Array,
			default: () => []
		}
	},
	setup(__props) {
		const props = __props;
		const { isDark, toggleDarkMode } = useDarkMode();
		const avatarPreview = ref(null);
		const fileInputRef = ref(null);
		const isDragging = ref(false);
		const requestVerification = () => {
			axios.post("/settings/request-verification").then((response) => {
				window.location.reload();
			}).catch((error) => {
				alert(error.response?.data?.error || "Error");
			});
		};
		const resendEmailVerification = () => {
			axios.post("/settings/resend-email-verification").then((response) => {
				alert("Email отправлен! Проверьте почту (mailhog на порту 8025)");
			}).catch((error) => {
				alert(error.response?.data?.error || "Error");
			});
		};
		const form = useForm({
			name: props.user.name,
			aboutme: props.user.aboutme || "",
			avatar: null,
			skills: props.userSkills || [],
			_method: "PUT"
		});
		const currentLength = computed(() => (form.aboutme || "").length);
		const remainingChars = computed(() => maxLength - currentLength.value);
		const pluralizeChars = (count) => {
			if (count === 1) return "символ";
			if (count >= 2 && count <= 4) return "символа";
			return "символов";
		};
		const handleAreaClick = () => {
			fileInputRef.value.click();
		};
		const handleFileSelect = (e) => {
			const file = e.target.files[0];
			if (file) processFile(file);
		};
		const handleDragOver = () => {
			isDragging.value = true;
		};
		const handleDragLeave = () => {
			isDragging.value = false;
		};
		const handleDrop = (e) => {
			isDragging.value = false;
			const file = e.dataTransfer.files[0];
			if (file && file.type.startsWith("image/")) processFile(file);
		};
		const processFile = (file) => {
			form.avatar = file;
			const reader = new FileReader();
			reader.onload = (e) => {
				avatarPreview.value = e.target.result;
			};
			reader.readAsDataURL(file);
		};
		function submit() {
			if (!form.avatar) form.transform((data) => {
				delete data.avatar;
				return data;
			});
			form.post(`/profile/${props.user.id}`, {
				forceFormData: true,
				preserveScroll: true,
				onSuccess: () => {
					if (form.avatar) {
						form.reset("avatar");
						avatarPreview.value = null;
					}
				}
			});
		}
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(AppLayout_default, _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="settings-container" data-v-5e9cf526${_scopeId}><div class="settings-header" data-v-5e9cf526${_scopeId}><h1 data-v-5e9cf526${_scopeId}>Настройки</h1></div><div class="settings-content" data-v-5e9cf526${_scopeId}><nav class="settings-nav" data-v-5e9cf526${_scopeId}>`);
						_push(ssrRenderComponent(unref(Link), {
							href: "/settings/profile",
							class: ["settings-nav-item", { active: __props.section === "profile" }]
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Профиль `);
								else return [createTextVNode(" Профиль ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(Link), {
							href: "/settings/privacy",
							class: ["settings-nav-item", { active: __props.section === "privacy" }]
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Приватность `);
								else return [createTextVNode(" Приватность ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(unref(Link), {
							href: "/settings/files",
							class: ["settings-nav-item", { active: __props.section === "files" }]
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Мои Файлы `);
								else return [createTextVNode(" Мои Файлы ")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</nav><div class="settings-panel" data-v-5e9cf526${_scopeId}>`);
						if (__props.section === "profile") {
							_push(`<div class="panel-profile" data-v-5e9cf526${_scopeId}><div class="edit-content" data-v-5e9cf526${_scopeId}><div class="avatar" data-v-5e9cf526${_scopeId}><div class="profile-header avatar-upload" data-v-5e9cf526${_scopeId}><input type="file" accept="image/*" style="${ssrRenderStyle({ "display": "none" })}" data-v-5e9cf526${_scopeId}>`);
							if (avatarPreview.value || __props.user.avatar) _push(`<img${ssrRenderAttr("src", avatarPreview.value || "/storage/" + __props.user.avatar)} class="avatar-preview" data-v-5e9cf526${_scopeId}>`);
							else _push(`<div class="no-avatar" data-v-5e9cf526${_scopeId}><span data-v-5e9cf526${_scopeId}>Нажмите для загрузки</span></div>`);
							if (avatarPreview.value || __props.user.avatar) _push(`<div class="avatar-overlay" data-v-5e9cf526${_scopeId}><button type="button" class="change-avatar-btn" data-v-5e9cf526${_scopeId}> Изменить фото </button></div>`);
							else _push(`<!---->`);
							_push(`</div>`);
							if (!__props.user.is_verified || __props.user.is_verified !== "verified") {
								_push(`<div class="verification-links" data-v-5e9cf526${_scopeId}>`);
								if (!__props.user.is_verified || __props.user.is_verified === "rejected") _push(ssrRenderComponent(unref(Link), {
									href: "#",
									onClick: requestVerification,
									class: "verification-link"
								}, {
									default: withCtx((_, _push, _parent, _scopeId) => {
										if (_push) _push(` Запросить верификацию `);
										else return [createTextVNode(" Запросить верификацию ")];
									}),
									_: 1
								}, _parent, _scopeId));
								else _push(`<!---->`);
								if (!__props.user.email_verified_at) _push(ssrRenderComponent(unref(Link), {
									href: "#",
									onClick: resendEmailVerification,
									class: "verification-link"
								}, {
									default: withCtx((_, _push, _parent, _scopeId) => {
										if (_push) _push(` Подтвердить почту `);
										else return [createTextVNode(" Подтвердить почту ")];
									}),
									_: 1
								}, _parent, _scopeId));
								else _push(`<!---->`);
								if (__props.user.is_verified === "pending") _push(`<p class="verification-status" data-v-5e9cf526${_scopeId}> Заявка на верификацию на рассмотрении </p>`);
								else _push(`<!---->`);
								_push(`</div>`);
							} else _push(`<!---->`);
							_push(`</div><div class="desc" data-v-5e9cf526${_scopeId}><form enctype="multipart/form-data" data-v-5e9cf526${_scopeId}><div class="form-group" data-v-5e9cf526${_scopeId}><label for="name" data-v-5e9cf526${_scopeId}>Имя:</label><div style="${ssrRenderStyle({
								"display": "flex",
								"gap": "20px"
							})}" data-v-5e9cf526${_scopeId}><input type="text" name="name" id="name"${ssrRenderAttr("value", unref(form).name)} required data-v-5e9cf526${_scopeId}><button type="button" class="${ssrRenderClass([{ dark: unref(isDark) }, "theme-toggle-btn"])}" data-v-5e9cf526${_scopeId}><span class="theme-toggle-track" data-v-5e9cf526${_scopeId}><span class="theme-toggle-thumb" data-v-5e9cf526${_scopeId}>`);
							if (unref(isDark)) _push(`<span data-v-5e9cf526${_scopeId}>🌙</span>`);
							else _push(`<span data-v-5e9cf526${_scopeId}>☀️</span>`);
							_push(`</span></span><span class="theme-toggle-label" data-v-5e9cf526${_scopeId}>${ssrInterpolate(unref(isDark) ? "Тёмная" : "Светлая")}</span></button></div></div><div class="form-group" data-v-5e9cf526${_scopeId}><label for="aboutme" data-v-5e9cf526${_scopeId}>О себе:</label><textarea name="aboutme" id="aboutme"${ssrRenderAttr("maxlength", maxLength)} data-v-5e9cf526${_scopeId}>${ssrInterpolate(unref(form).aboutme)}</textarea><div class="${ssrRenderClass([{ warning: remainingChars.value <= warningThreshold }, "char-counter"])}" data-v-5e9cf526${_scopeId}>`);
							if (remainingChars.value <= warningThreshold) _push(`<span data-v-5e9cf526${_scopeId}> Осталось ${ssrInterpolate(remainingChars.value)} ${ssrInterpolate(pluralizeChars(remainingChars.value))}</span>`);
							else _push(`<span data-v-5e9cf526${_scopeId}>${ssrInterpolate(currentLength.value)} / ${ssrInterpolate(maxLength)}</span>`);
							_push(`</div></div><div class="form-group" data-v-5e9cf526${_scopeId}><label data-v-5e9cf526${_scopeId}>Ваши навыки:</label>`);
							_push(ssrRenderComponent(SkillsSelector_default, {
								skills: __props.skills,
								modelValue: unref(form).skills,
								"onUpdate:modelValue": ($event) => unref(form).skills = $event
							}, null, _parent, _scopeId));
							_push(`</div><div class="form-actions" data-v-5e9cf526${_scopeId}><button type="submit" class="btn-save"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""} data-v-5e9cf526${_scopeId}>${ssrInterpolate(unref(form).processing ? "Сохранение..." : "Сохранить изменения")}</button>`);
							_push(ssrRenderComponent(unref(Link), {
								href: "/profile/" + __props.user.id,
								class: "btn-cancel"
							}, {
								default: withCtx((_, _push, _parent, _scopeId) => {
									if (_push) _push(` Отмена `);
									else return [createTextVNode(" Отмена ")];
								}),
								_: 1
							}, _parent, _scopeId));
							_push(`</div></form></div></div></div>`);
						} else if (__props.section === "privacy") _push(`<div class="panel-privacy" data-v-5e9cf526${_scopeId}><h2 data-v-5e9cf526${_scopeId}>Настройки приватности</h2><p class="coming-soon" data-v-5e9cf526${_scopeId}>Раздел в разработке</p></div>`);
						else if (__props.section === "files") {
							_push(`<div class="panel-files" data-v-5e9cf526${_scopeId}><h2 data-v-5e9cf526${_scopeId}>Ваши файлы</h2>`);
							if (__props.userFiles && __props.userFiles.length > 0) {
								_push(`<div class="files-list" data-v-5e9cf526${_scopeId}><!--[-->`);
								ssrRenderList(__props.userFiles, (file) => {
									_push(`<div class="file-item" data-v-5e9cf526${_scopeId}><div class="file-info" data-v-5e9cf526${_scopeId}><span class="file-icon" data-v-5e9cf526${_scopeId}>📄</span><span class="file-name" data-v-5e9cf526${_scopeId}>${ssrInterpolate(file.name)}</span></div><div class="file-actions" data-v-5e9cf526${_scopeId}><a${ssrRenderAttr("href", file.url)} target="_blank" class="file-view-btn" data-v-5e9cf526${_scopeId}>Просмотр</a></div></div>`);
								});
								_push(`<!--]--></div>`);
							} else _push(`<div class="no-files" data-v-5e9cf526${_scopeId}><p data-v-5e9cf526${_scopeId}>У вас пока нет загруженных файлов</p><p class="no-files-hint" data-v-5e9cf526${_scopeId}>Файлы можно загрузить при регистрации или редактировании профиля</p></div>`);
							_push(`</div>`);
						} else _push(`<!---->`);
						_push(`</div></div></div>`);
					} else return [createVNode("div", { class: "settings-container" }, [createVNode("div", { class: "settings-header" }, [createVNode("h1", null, "Настройки")]), createVNode("div", { class: "settings-content" }, [createVNode("nav", { class: "settings-nav" }, [
						createVNode(unref(Link), {
							href: "/settings/profile",
							class: ["settings-nav-item", { active: __props.section === "profile" }]
						}, {
							default: withCtx(() => [createTextVNode(" Профиль ")]),
							_: 1
						}, 8, ["class"]),
						createVNode(unref(Link), {
							href: "/settings/privacy",
							class: ["settings-nav-item", { active: __props.section === "privacy" }]
						}, {
							default: withCtx(() => [createTextVNode(" Приватность ")]),
							_: 1
						}, 8, ["class"]),
						createVNode(unref(Link), {
							href: "/settings/files",
							class: ["settings-nav-item", { active: __props.section === "files" }]
						}, {
							default: withCtx(() => [createTextVNode(" Мои Файлы ")]),
							_: 1
						}, 8, ["class"])
					]), createVNode("div", { class: "settings-panel" }, [__props.section === "profile" ? (openBlock(), createBlock("div", {
						key: 0,
						class: "panel-profile"
					}, [createVNode("div", { class: "edit-content" }, [createVNode("div", { class: "avatar" }, [createVNode("div", {
						class: "profile-header avatar-upload",
						onClick: handleAreaClick,
						onDragover: withModifiers(handleDragOver, ["prevent"]),
						onDragleave: handleDragLeave,
						onDrop: withModifiers(handleDrop, ["prevent"])
					}, [
						createVNode("input", {
							type: "file",
							ref_key: "fileInputRef",
							ref: fileInputRef,
							accept: "image/*",
							style: { "display": "none" },
							onChange: handleFileSelect
						}, null, 544),
						avatarPreview.value || __props.user.avatar ? (openBlock(), createBlock("img", {
							key: 0,
							src: avatarPreview.value || "/storage/" + __props.user.avatar,
							class: "avatar-preview"
						}, null, 8, ["src"])) : (openBlock(), createBlock("div", {
							key: 1,
							class: "no-avatar"
						}, [createVNode("span", null, "Нажмите для загрузки")])),
						avatarPreview.value || __props.user.avatar ? (openBlock(), createBlock("div", {
							key: 2,
							class: "avatar-overlay"
						}, [createVNode("button", {
							type: "button",
							onClick: withModifiers(handleAreaClick, ["stop"]),
							class: "change-avatar-btn"
						}, " Изменить фото ")])) : createCommentVNode("", true)
					], 32), !__props.user.is_verified || __props.user.is_verified !== "verified" ? (openBlock(), createBlock("div", {
						key: 0,
						class: "verification-links"
					}, [
						!__props.user.is_verified || __props.user.is_verified === "rejected" ? (openBlock(), createBlock(unref(Link), {
							key: 0,
							href: "#",
							onClick: withModifiers(requestVerification, ["prevent"]),
							class: "verification-link"
						}, {
							default: withCtx(() => [createTextVNode(" Запросить верификацию ")]),
							_: 1
						})) : createCommentVNode("", true),
						!__props.user.email_verified_at ? (openBlock(), createBlock(unref(Link), {
							key: 1,
							href: "#",
							onClick: withModifiers(resendEmailVerification, ["prevent"]),
							class: "verification-link"
						}, {
							default: withCtx(() => [createTextVNode(" Подтвердить почту ")]),
							_: 1
						})) : createCommentVNode("", true),
						__props.user.is_verified === "pending" ? (openBlock(), createBlock("p", {
							key: 2,
							class: "verification-status"
						}, " Заявка на верификацию на рассмотрении ")) : createCommentVNode("", true)
					])) : createCommentVNode("", true)]), createVNode("div", { class: "desc" }, [createVNode("form", {
						onSubmit: withModifiers(submit, ["prevent"]),
						enctype: "multipart/form-data"
					}, [
						createVNode("div", { class: "form-group" }, [createVNode("label", { for: "name" }, "Имя:"), createVNode("div", { style: {
							"display": "flex",
							"gap": "20px"
						} }, [withDirectives(createVNode("input", {
							type: "text",
							name: "name",
							id: "name",
							"onUpdate:modelValue": ($event) => unref(form).name = $event,
							required: ""
						}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).name]]), createVNode("button", {
							type: "button",
							class: ["theme-toggle-btn", { dark: unref(isDark) }],
							onClick: unref(toggleDarkMode)
						}, [createVNode("span", { class: "theme-toggle-track" }, [createVNode("span", { class: "theme-toggle-thumb" }, [unref(isDark) ? (openBlock(), createBlock("span", { key: 0 }, "🌙")) : (openBlock(), createBlock("span", { key: 1 }, "☀️"))])]), createVNode("span", { class: "theme-toggle-label" }, toDisplayString(unref(isDark) ? "Тёмная" : "Светлая"), 1)], 10, ["onClick"])])]),
						createVNode("div", { class: "form-group" }, [
							createVNode("label", { for: "aboutme" }, "О себе:"),
							withDirectives(createVNode("textarea", {
								name: "aboutme",
								id: "aboutme",
								"onUpdate:modelValue": ($event) => unref(form).aboutme = $event,
								maxlength: maxLength
							}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).aboutme]]),
							createVNode("div", { class: ["char-counter", { warning: remainingChars.value <= warningThreshold }] }, [remainingChars.value <= warningThreshold ? (openBlock(), createBlock("span", { key: 0 }, " Осталось " + toDisplayString(remainingChars.value) + " " + toDisplayString(pluralizeChars(remainingChars.value)), 1)) : (openBlock(), createBlock("span", { key: 1 }, toDisplayString(currentLength.value) + " / " + toDisplayString(maxLength), 1))], 2)
						]),
						createVNode("div", { class: "form-group" }, [createVNode("label", null, "Ваши навыки:"), createVNode(SkillsSelector_default, {
							skills: __props.skills,
							modelValue: unref(form).skills,
							"onUpdate:modelValue": ($event) => unref(form).skills = $event
						}, null, 8, [
							"skills",
							"modelValue",
							"onUpdate:modelValue"
						])]),
						createVNode("div", { class: "form-actions" }, [createVNode("button", {
							type: "submit",
							class: "btn-save",
							disabled: unref(form).processing
						}, toDisplayString(unref(form).processing ? "Сохранение..." : "Сохранить изменения"), 9, ["disabled"]), createVNode(unref(Link), {
							href: "/profile/" + __props.user.id,
							class: "btn-cancel"
						}, {
							default: withCtx(() => [createTextVNode(" Отмена ")]),
							_: 1
						}, 8, ["href"])])
					], 32)])])])) : __props.section === "privacy" ? (openBlock(), createBlock("div", {
						key: 1,
						class: "panel-privacy"
					}, [createVNode("h2", null, "Настройки приватности"), createVNode("p", { class: "coming-soon" }, "Раздел в разработке")])) : __props.section === "files" ? (openBlock(), createBlock("div", {
						key: 2,
						class: "panel-files"
					}, [createVNode("h2", null, "Ваши файлы"), __props.userFiles && __props.userFiles.length > 0 ? (openBlock(), createBlock("div", {
						key: 0,
						class: "files-list"
					}, [(openBlock(true), createBlock(Fragment, null, renderList(__props.userFiles, (file) => {
						return openBlock(), createBlock("div", {
							key: file.type,
							class: "file-item"
						}, [createVNode("div", { class: "file-info" }, [createVNode("span", { class: "file-icon" }, "📄"), createVNode("span", { class: "file-name" }, toDisplayString(file.name), 1)]), createVNode("div", { class: "file-actions" }, [createVNode("a", {
							href: file.url,
							target: "_blank",
							class: "file-view-btn"
						}, "Просмотр", 8, ["href"])])]);
					}), 128))])) : (openBlock(), createBlock("div", {
						key: 1,
						class: "no-files"
					}, [createVNode("p", null, "У вас пока нет загруженных файлов"), createVNode("p", { class: "no-files-hint" }, "Файлы можно загрузить при регистрации или редактировании профиля")]))])) : createCommentVNode("", true)])])])];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Settings/Index.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var Index_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$1, [["__scopeId", "data-v-5e9cf526"]]);
//#endregion
//#region resources/js/Pages/Settings/Notifications.vue
var Notifications_exports = /* @__PURE__ */ __exportAll({ default: () => Notifications_default });
var _sfc_main = {
	__name: "Notifications",
	__ssrInlineRender: true,
	props: {
		notifications: {
			type: Array,
			default: () => []
		},
		unreadCount: {
			type: Number,
			default: 0
		}
	},
	setup(__props) {
		const props = __props;
		useDarkMode();
		const notifications = ref([...props.notifications]);
		const unreadCount = ref(props.unreadCount);
		const handleNotificationClick = async (notification) => {
			if (!notification.is_read) try {
				await axios$1.post("/notifications/mark-read", { id: notification.id });
				notification.is_read = true;
				unreadCount.value = Math.max(0, unreadCount.value - 1);
			} catch (err) {
				console.error("Ошибка обновления уведомления:", err);
			}
			if (notification.link) router.visit(notification.link);
		};
		const markAllAsRead = async () => {
			try {
				await axios$1.post("/notifications/mark-read", { all: true });
				notifications.value.forEach((n) => n.is_read = true);
				unreadCount.value = 0;
			} catch (err) {
				console.error("Ошибка обновления уведомлений:", err);
			}
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(AppLayout_default, _attrs, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="notifications-container" data-v-39ca3cfe${_scopeId}><div class="notifications-header" data-v-39ca3cfe${_scopeId}><h1 data-v-39ca3cfe${_scopeId}>Уведомления</h1>`);
						if (unreadCount.value > 0) _push(`<button class="mark-all-btn" data-v-39ca3cfe${_scopeId}> Отметить все как прочитанные </button>`);
						else _push(`<!---->`);
						_push(`</div>`);
						if (notifications.value.length === 0) _push(`<div class="empty-notifications" data-v-39ca3cfe${_scopeId}><p data-v-39ca3cfe${_scopeId}>У вас пока нет уведомлений</p></div>`);
						else {
							_push(`<div class="notifications-list" data-v-39ca3cfe${_scopeId}><!--[-->`);
							ssrRenderList(notifications.value, (notification) => {
								_push(`<div class="${ssrRenderClass([{ unread: !notification.is_read }, "notification-item"])}" data-v-39ca3cfe${_scopeId}><div class="notification-icon" data-v-39ca3cfe${_scopeId}>`);
								if (notification.type === "message") _push(`<span data-v-39ca3cfe${_scopeId}>💬</span>`);
								else if (notification.type === "post_warning") _push(`<span data-v-39ca3cfe${_scopeId}>⚠️</span>`);
								else if (notification.type === "post_hidden") _push(`<span data-v-39ca3cfe${_scopeId}>🚫</span>`);
								else _push(`<span data-v-39ca3cfe${_scopeId}>🔔</span>`);
								_push(`</div><div class="notification-content" data-v-39ca3cfe${_scopeId}><div class="notification-title" data-v-39ca3cfe${_scopeId}>${ssrInterpolate(notification.title)}</div><div class="notification-text" data-v-39ca3cfe${_scopeId}>${ssrInterpolate(notification.content)}</div><div class="notification-time" data-v-39ca3cfe${_scopeId}>${ssrInterpolate(notification.created_at)}</div></div>`);
								if (!notification.is_read) _push(`<div class="unread-dot" data-v-39ca3cfe${_scopeId}></div>`);
								else _push(`<!---->`);
								_push(`</div>`);
							});
							_push(`<!--]--></div>`);
						}
						_push(`</div>`);
					} else return [createVNode("div", { class: "notifications-container" }, [createVNode("div", { class: "notifications-header" }, [createVNode("h1", null, "Уведомления"), unreadCount.value > 0 ? (openBlock(), createBlock("button", {
						key: 0,
						onClick: markAllAsRead,
						class: "mark-all-btn"
					}, " Отметить все как прочитанные ")) : createCommentVNode("", true)]), notifications.value.length === 0 ? (openBlock(), createBlock("div", {
						key: 0,
						class: "empty-notifications"
					}, [createVNode("p", null, "У вас пока нет уведомлений")])) : (openBlock(), createBlock("div", {
						key: 1,
						class: "notifications-list"
					}, [(openBlock(true), createBlock(Fragment, null, renderList(notifications.value, (notification) => {
						return openBlock(), createBlock("div", {
							key: notification.id,
							class: ["notification-item", { unread: !notification.is_read }],
							onClick: ($event) => handleNotificationClick(notification)
						}, [
							createVNode("div", { class: "notification-icon" }, [notification.type === "message" ? (openBlock(), createBlock("span", { key: 0 }, "💬")) : notification.type === "post_warning" ? (openBlock(), createBlock("span", { key: 1 }, "⚠️")) : notification.type === "post_hidden" ? (openBlock(), createBlock("span", { key: 2 }, "🚫")) : (openBlock(), createBlock("span", { key: 3 }, "🔔"))]),
							createVNode("div", { class: "notification-content" }, [
								createVNode("div", { class: "notification-title" }, toDisplayString(notification.title), 1),
								createVNode("div", { class: "notification-text" }, toDisplayString(notification.content), 1),
								createVNode("div", { class: "notification-time" }, toDisplayString(notification.created_at), 1)
							]),
							!notification.is_read ? (openBlock(), createBlock("div", {
								key: 0,
								class: "unread-dot"
							})) : createCommentVNode("", true)
						], 10, ["onClick"]);
					}), 128))]))])];
				}),
				_: 1
			}, _parent));
		};
	}
};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Settings/Notifications.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var Notifications_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-39ca3cfe"]]);
//#endregion
//#region resources/js/ssr.js
createServer((page) => createInertiaApp({
	page,
	render: renderToString,
	resolve: (name) => {
		return (/* @__PURE__ */ Object.assign({
			"./Pages/Admin/Comments.vue": Comments_exports,
			"./Pages/Admin/Index.vue": Index_exports$3,
			"./Pages/Admin/Posts.vue": Posts_exports,
			"./Pages/Admin/Users.vue": Users_exports,
			"./Pages/Auth/Auth.vue": Auth_exports,
			"./Pages/Balance/Index.vue": Index_exports$2,
			"./Pages/Chat/Chats.vue": Chats_exports,
			"./Pages/Disputes/Index.vue": Index_exports$1,
			"./Pages/Home.vue": Home_exports,
			"./Pages/Posts/Create.vue": Create_exports,
			"./Pages/Posts/Edit.vue": Edit_exports$1,
			"./Pages/Posts/Show.vue": Show_exports$1,
			"./Pages/Profile/Edit.vue": Edit_exports,
			"./Pages/Profile/Followers.vue": Followers_exports,
			"./Pages/Profile/Following.vue": Following_exports,
			"./Pages/Profile/LikedPosts.vue": LikedPosts_exports,
			"./Pages/Profile/Ratings.vue": Ratings_exports,
			"./Pages/Profile/Show.vue": Show_exports,
			"./Pages/Settings/Index.vue": Index_exports,
			"./Pages/Settings/Notifications.vue": Notifications_exports
		}))[`./Pages/${name}.vue`];
	},
	setup({ App, props, plugin }) {
		return createSSRApp({ render: () => h(App, props) }).use(plugin);
	}
}));
//#endregion
export {};
