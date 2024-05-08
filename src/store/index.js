import {createStore} from "vuex";
import axiosClient from "../axios";

const store = createStore({
  state: {
    user: {
      data: {},
      token: sessionStorage.getItem("TOKEN"),
    },
    posts: {
      loading: true,
      links: [],
      data: [],
    },
    postsFilter: {
      page: 1,
      search: '',
      from_date: false,
      to_date: false,
      all: false,
      category_id: 0,
      available_sorting: [
        {name: 'Date latest', value: 'created_at-desc'},
        {name: 'Date oldest', value: 'created_at-asc'},
        {name: 'Title A-z', value: 'title-asc'},
        {name: 'Title Z-a', value: 'title-desc'},
      ],
      sorting: 'date-desc',
    },
    currentPost: {
      data: {},
      loading: false,
    },
    categories: {
      loading: false,
      links: [],
      data: []
    },
    currentCategory: {
      data: {},
      loading: false,
    },
    notifications: {
      loading: false,
      links: [],
      data: []
    },
    notification: {
      show: false,
      type: 'success',
      message: ''
    },
    dashboard: {
      data: {},
      loading: false
    },
    errors: {
      login: {
        data : {
          name: '',
          email: '',
        }
      }
    },
    app: {

    },
  },
  getters: {},
  actions: {
    register({commit}, user) {
      return axiosClient.post('/api/v1/auth/register', user)
        .then(({data}) => {
          commit('setUser', data.user);
          commit('setToken', data.token);
          return data;
        })
    },
    login({commit}, user) {
      return axiosClient.post('/api/v1/auth/login', user)
        .then((response) => {
          if (typeof response.data === 'undefined') {
            return {
              'error': true,
              'data': response.response.data.errors
            };
          } else {
            commit('setUser', response.data.user);
            commit('setToken', response.data.user.token);
            return {
              'error': false,
              'data': response.data
            };
          }
        })
    },
    logout({commit}) {
      return axiosClient.post('/api/v1/auth/logout')
        .then(response => {
          commit('logout')
          return response;
        })
    },
    // resetErrors({commit}, errorPage) {
    //   if (errorPage === 'login') {
    //     commit('setLoginPageErrors', {
    //       name: '',
    //       email: '',
    //     });
    //   }
    // },

    /* User */
    getUser({commit}) {
      return axiosClient.get('/api/v1/auth/me')
        .then(res => {
          commit('setUser', res.data)
          return res.data;
        })
    },
    /* Post */
    getPosts({commit}, params = null) {
      let url = '/api/v1/posts';

      if (params !== null && params.page !== undefined && params.page !== false) {
        url += `?page=${params.page}`;
      }

      if (params !== null && params.category_id !== undefined && params.category_id !== false) {
        url += (url.includes('?') ? '&' : '?') + `category_id=${params.category_id}`;
      }

      if (params !== null && params.search !== undefined && params.search !== false) {
        url += (url.includes('?') || url.includes('&') ? '&' : '?') + `search=${encodeURIComponent(params.search)}`;
      }

      if (params !== null && params.sorting !== undefined && params.sorting !== false) {
        url += (url.includes('?') || url.includes('&') ? '&' : '?') + `sorting=${encodeURIComponent(params.sorting)}`;
      }

      commit('setPostsLoading', true);
      return axiosClient.get(url)
          .then((res) => {
            commit('setPostsLoading', false);
            commit("setPosts", res.data);
          })
    },
    getPost({commit}, id) {
      commit("setCurrentPostLoading", true);
      return axiosClient
          .get(`/api/v1/posts/${id}`)
          .then((res) => {
            commit("setCurrentPost", res.data);
            commit("setCurrentPostLoading", false);
            return res;
          })
          .catch((err) => {
            commit("setCurrentPostLoading", false);
            throw err;
          });
    },
    deletePost({dispatch}, id) {
      return axiosClient
          .delete(`/api/v1/posts/${id}`)
          .then((res) => {
            dispatch('getPosts');
            return res;
          });
    },
    updatePost({commit}, post) {
      return axiosClient
          .put(`/api/v1/posts/${post.id}`, post)
          .then((res) => {
            commit('updatePost', res.data);
            return res;
          });
    },
    createPost({commit}, post) {
      let response;
        // Create
      response = axiosClient
          .post('/api/v1/posts', post)
          .then((res) => {
            commit('savePost', res.data);
            return res;
          });
      return response;
    },
    changePostsPage({commit}, page) {
      commit('changePostsPage', page);
    },
    /* Categories */
    getCategories({commit}) {
      commit('setCategoriesLoading', true);
      return axiosClient.get('/api/v1/categories')
          .then((res) => {
            commit('setCategoriesLoading', false);
            commit("setCategories", res.data);
          });
    },
    getCategory({commit}, id) {
      commit("setCurrentCategoryLoading", true);
      return axiosClient
          .get(`/api/v1/categories/${id}`)
          .then((res) => {
            commit("setCurrentCategory", res.data);
            commit("setCurrentCategoryLoading", false);
            return res;
          })
          .catch((err) => {
            commit("setCurrentCategoryLoading", false);
            throw err;
          });
    },
    updateCategory({dispatch}, category) {
      let response;
      // update
      return axiosClient
          .put(`/api/v1/categories/${category.id}`, category)
          .then((res) => {
            dispatch('getCategories')
            return res;
          });
    },
    createCategory({dispatch}, category) {
      let response;
      // Create
      response = axiosClient
          .post('/api/v1/categories', category)
          .then((res) => {
            dispatch('getCategories')
            return res;
          });
    },
    deleteCategory({dispatch}, id) {
      return axiosClient
          .delete(`/api/v1/categories/${id}`)
          .then((res) => {
            dispatch('getCategories');
            return res;
          });
    },
    /* Notifications */
    getNotifications({commit}, page = null) {
      let url = (! page) ? '/api/v1/notifications' : '/api/v1/notifications?page=' + page;
      commit('setNotificationsLoading', true);
      return axiosClient.get(url)
          .then((res) => {
            commit("setNotifications", res.data);
            commit('setNotificationsLoading', false);
          })
    },
    readNotification({dispatch}, id) {
      return axiosClient
          .post(`/api/v1/notifications/read`, {'id':id})
          .then((res) => {
            dispatch("getNotifications");
            return res;
          });
    },
    unreadNotification({dispatch}, id) {
      return axiosClient
          .post(`/api/v1/notifications/unread`, {'id':id})
          .then((res) => {
            dispatch("getNotifications");
            return res;
          });
    },
  },


  mutations: {
    logout: (state) => {
      state.user.token = null;
      state.user.data = {};
      sessionStorage.removeItem("TOKEN");
    },
    setUser: (state, user) => {
      state.user.data = user;
    },
    setToken: (state, token) => {
      state.user.token = token;
      sessionStorage.setItem('TOKEN', token);
    },
    dashboardLoading: (state, loading) => {
      state.dashboard.loading = loading;
    },
    setDashboardData: (state, data) => {
      state.dashboard.data = data
    },
    setLoginPageErrors: (state, data) => {
      state.errors.login.data = data
    },
    // PostsFilter
    setPostsFilterCategoryDefault: (state) => {
      state.postsFilter.category_id = state.categories.data[0].id
    },

    // Post
    savePost: (state, post) => {
      state.posts = [...state.posts.data, post.data];
    },
    changePostsPage: (state, page) => {
      state.posts.currentPage = page;
    },
    updatePost: (state, post) => {
      state.posts = state.posts.map((s) => {
        if (s.id === post.id) {
          return post;
        }
      });
      state.posts = [...state.posts, post.data];
    },
    setPostsLoading: (state, loading) => {
      state.posts.loading = loading;
    },
    setCurrentPostLoading: (state, loading) => {
      state.currentPost.loading = loading;
    },
    setPosts: (state, posts) => {
      state.posts.links = posts.meta.links;
      state.posts.data = posts.data;
    },
    setCurrentPost: (state, post) => {
      state.currentPost.data = post.post;
    },

    // Category
    saveCategory: (state, category) => {
      state.categories = [...state.categories, category.data];
    },
    updateCategory: (state, category) => {
      state.categories = state.categories.map((s) => {
        if (s.id === category.id) {
          return category;
        }
      });
      state.categories = [...state.categories, category.data];
    },
    setCategoriesLoading: (state, loading) => {
      state.posts.loading = loading;
    },
    setCurrentCategoryLoading: (state, loading) => {
      state.currentCategory.loading = loading;
    },
    setCategories: (state, categories) => {
      state.categories.links = categories.links;
      state.categories.data = categories;
    },
    setCurrentCategory: (state, category) => {
      state.currentCategory.data = category.category;
    },
    setNotifications: (state, notifications) => {
      state.notifications.links = notifications.meta.links;
      state.notifications.data = notifications.data;
    },
    setNotificationsLoading: (state, loading) => {
      state.notifications.loading = loading;
    },
    notify: (state, {message, type}) => {
      state.notification.show = true;
      state.notification.type = type;
      state.notification.message = message;
      setTimeout(() => {
        state.notification.show = false;
      }, 3000)
    },
  },
  modules: {}
});

export default store;
