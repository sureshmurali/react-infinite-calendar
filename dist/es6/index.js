import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import moment from 'moment';
import debounce from 'lodash/debounce';
import range from 'lodash/range';
import { getScrollSpeed, getMonthsForYear, keyCodes, parseDate, validDate, validDisplay, validLayout } from './utils';
import defaultLocale from './locale';
import defaultTheme from './theme';
import Today from './Today';
import Header from './Header';
import List from './List';
import Weekdays from './Weekdays';
import Years from './Years';

var containerStyle = {
	'root': 'Cal__Container__root',
	'landscape': 'Cal__Container__landscape',
	'wrapper': 'Cal__Container__wrapper',
	'listWrapper': 'Cal__Container__listWrapper'
};
var dayStyle = {
	'root': 'Cal__Day__root',
	'enabled': 'Cal__Day__enabled',
	'highlighted': 'Cal__Day__highlighted',
	'today': 'Cal__Day__today',
	'disabled': 'Cal__Day__disabled',
	'selected': 'Cal__Day__selected',
	'month': 'Cal__Day__month',
	'year': 'Cal__Day__year',
	'selection': 'Cal__Day__selection',
	'day': 'Cal__Day__day'
};
var style = {
	container: containerStyle,
	day: dayStyle
};

var InfiniteCalendar = function (_Component) {
	babelHelpers.inherits(InfiniteCalendar, _Component);

	function InfiniteCalendar(props) {
		babelHelpers.classCallCheck(this, InfiniteCalendar);

		var _this = babelHelpers.possibleConstructorReturn(this, (InfiniteCalendar.__proto__ || Object.getPrototypeOf(InfiniteCalendar)).call(this));

		_this.onDaySelect = function (selectedDate, e) {
			var shouldHeaderAnimate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _this.props.shouldHeaderAnimate;
			var _this$props = _this.props,
			    afterSelect = _this$props.afterSelect,
			    beforeSelect = _this$props.beforeSelect,
			    onSelect = _this$props.onSelect;

			var selectedDates = _this.state.selectedDates || [];
			var dateIndex = _this.getSelectedDateIndex(selectedDate);
			var isSelected = dateIndex === -1;

			if (!beforeSelect || typeof beforeSelect == 'function' && beforeSelect(selectedDate, isSelected, selectedDates)) {
				if (typeof onSelect == 'function') {
					onSelect(selectedDate, isSelected, selectedDates, e);
				}

				if (isSelected) {
					selectedDates.push(selectedDate);
				} else {
					selectedDates.splice(dateIndex, 1);
				}

				selectedDates = _this.parseSelectedDates(selectedDates);
				_this.setState({
					selectedDates: selectedDates,
					shouldHeaderAnimate: shouldHeaderAnimate,
					highlightedDate: selectedDate.clone()
				}, function () {
					_this.clearHighlight();
					if (typeof afterSelect == 'function') {
						afterSelect(selectedDate, isSelected, selectedDates);
					}
				});
			}
		};

		_this.getSelectedDateIndex = function (date) {
			var selectedDates = _this.state.selectedDates;

			var i = 0;
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = selectedDates[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var selectedDate = _step.value;

					if (selectedDate.format('YYYYMMDD') === date.format('YYYYMMDD')) {
						return i;
					}
					i++;
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			return -1;
		};

		_this.getCurrentOffset = function () {
			return _this.scrollTop;
		};

		_this.getDateOffset = function (date) {
			return _this.list && _this.list.getDateOffset(date);
		};

		_this.scrollTo = function (offset) {
			return _this.list && _this.list.scrollTo(offset);
		};

		_this.scrollToDate = function () {
			var date = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : moment();
			var offset = arguments[1];

			return _this.list && _this.list.scrollToDate(date, offset);
		};

		_this.getScrollSpeed = getScrollSpeed();

		_this.onScroll = function (_ref) {
			var scrollTop = _ref.scrollTop;
			var _this$props2 = _this.props,
			    onScroll = _this$props2.onScroll,
			    showOverlay = _this$props2.showOverlay,
			    showTodayHelper = _this$props2.showTodayHelper;
			var isScrolling = _this.state.isScrolling;

			var scrollSpeed = _this.scrollSpeed = Math.abs(_this.getScrollSpeed(scrollTop));
			_this.scrollTop = scrollTop;

			// We only want to display the months overlay if the user is rapidly scrolling
			if (showOverlay && scrollSpeed >= 50 && !isScrolling) {
				_this.setState({
					isScrolling: true
				});
			}

			if (showTodayHelper) {
				_this.updateTodayHelperPosition(scrollSpeed);
			}
			if (typeof onScroll == 'function') {
				onScroll(scrollTop);
			}
			_this.onScrollEnd();
		};

		_this.onScrollEnd = debounce(function () {
			var _this$props3 = _this.props,
			    onScrollEnd = _this$props3.onScrollEnd,
			    showTodayHelper = _this$props3.showTodayHelper;
			var isScrolling = _this.state.isScrolling;


			if (isScrolling) _this.setState({ isScrolling: false });
			if (showTodayHelper) _this.updateTodayHelperPosition(0);
			if (typeof onScrollEnd == 'function') onScrollEnd(_this.scrollTop);
		}, 150);

		_this.updateTodayHelperPosition = function (scrollSpeed) {
			var date = _this.today.date;
			if (!_this.todayOffset) _this.todayOffset = _this.getDateOffset(date); //scrollTop offset of the month "today" is in

			var scrollTop = _this.scrollTop;
			var showToday = _this.state.showToday;
			var _this$props4 = _this.props,
			    height = _this$props4.height,
			    rowHeight = _this$props4.rowHeight,
			    todayHelperRowOffset = _this$props4.todayHelperRowOffset;

			var newState = void 0;
			var dayOffset = Math.ceil((date.date() - 7 + moment(date).startOf("month").day()) / 7) * rowHeight; //offset of "today" within its month

			if (scrollTop >= _this.todayOffset + dayOffset + rowHeight * (todayHelperRowOffset + 1)) {
				if (showToday !== 1) newState = 1; //today is above the fold
			} else if (scrollTop + height <= _this.todayOffset + dayOffset + rowHeight - rowHeight * (todayHelperRowOffset + 1)) {
				if (showToday !== -1) newState = -1; //today is below the fold
			} else if (showToday && scrollSpeed <= 1) {
				newState = false;
			}

			if (scrollTop == 0) {
				newState = false;
			}

			if (newState != null) {
				_this.setState({ showToday: newState });
			}
		};

		_this.handleKeyDown = function (e) {
			var _this$props5 = _this.props,
			    maxDate = _this$props5.maxDate,
			    minDate = _this$props5.minDate,
			    onKeyDown = _this$props5.onKeyDown;
			var _this$state = _this.state,
			    display = _this$state.display,
			    selectedDates = _this$state.selectedDates,
			    highlightedDate = _this$state.highlightedDate,
			    showToday = _this$state.showToday;

			var delta = 0;

			if (typeof onKeyDown == 'function') {
				onKeyDown(e);
			}
			if ([keyCodes.left, keyCodes.up, keyCodes.right, keyCodes.down].indexOf(e.keyCode) > -1 && typeof e.preventDefault == 'function') {
				e.preventDefault();
			}

			if (!selectedDates) {
				selectedDates.push(moment());
			}

			if (display == 'days') {
				if (!highlightedDate) {
					highlightedDate = selectedDates[0].clone();
					_this.setState({ highlightedDate: highlightedDate });
				}

				switch (e.keyCode) {
					case keyCodes.enter:
						_this.onDaySelect(moment(highlightedDate), e);
						return;
					case keyCodes.left:
						delta = -1;
						break;
					case keyCodes.right:
						delta = +1;
						break;
					case keyCodes.down:
						delta = +7;
						break;
					case keyCodes.up:
						delta = -7;
						break;
				}

				if (delta) {
					var rowHeight = _this.props.rowHeight;

					var newHighlightedDate = moment(highlightedDate).add(delta, 'days');

					// Make sure the new highlighted date isn't before min / max
					if (newHighlightedDate.isBefore(minDate)) {
						newHighlightedDate = moment(minDate);
					} else if (newHighlightedDate.isAfter(maxDate)) {
						newHighlightedDate = moment(maxDate);
					}

					// Update the highlight indicator
					_this.clearHighlight();

					// Scroll the view
					if (!_this.currentOffset) _this.currentOffset = _this.getCurrentOffset();
					var currentOffset = _this.currentOffset;
					var monthOffset = _this.getDateOffset(newHighlightedDate);
					var navOffset = showToday ? 36 : 0;

					var highlightedEl = _this.highlightedEl = _this.node.querySelector('[data-date=\'' + newHighlightedDate.format('YYYYMMDD') + '\']');

					// Edge-case: if the user tries to use the keyboard when the new highlighted date isn't rendered because it's too far off-screen
					// We need to scroll to the month of the new highlighted date so it renders
					if (!highlightedEl) {
						_this.scrollTo(monthOffset - navOffset);
						return;
					}

					highlightedEl.classList.add(style.day.highlighted);

					var dateOffset = highlightedEl.offsetTop - rowHeight;
					var newOffset = monthOffset + dateOffset;

					if (currentOffset !== newOffset) {
						_this.currentOffset = newOffset;
						_this.scrollTo(newOffset - navOffset);
					}

					// Update the reference to the currently highlighted date
					_this.setState({
						highlightedDate: newHighlightedDate
					});
				}
			} else if (display == 'years' && _this.refs.years) {
				_this.refs.years.handleKeyDown(e);
			}
		};

		_this.setDisplay = function (display) {
			_this.setState({ display: display });
		};

		console.log("Coming or Not");
		// Initialize
		_this.updateLocale(props.locale);
		_this.updateYears(props);
		_this.state = {
			selectedDates: _this.parseSelectedDates(props.selectedDates),
			display: props.display,
			shouldHeaderAnimate: props.shouldHeaderAnimate,
			showHeader: props.showHeader && !props.multiDate
		};
		return _this;
	}

	babelHelpers.createClass(InfiniteCalendar, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			var _props = this.props,
			    autoFocus = _props.autoFocus,
			    keyboardSupport = _props.keyboardSupport;

			this.node = this.refs.node;
			this.list = this.refs.List;

			if (keyboardSupport && autoFocus) {
				this.node.focus();
			}
		}
	}, {
		key: 'parseSelectedDate',
		value: function parseSelectedDate(selectedDate) {
			if (selectedDate) {
				selectedDate = moment(selectedDate);

				// Selected Date should not be before min date or after max date
				if (selectedDate.isBefore(this._minDate)) {
					return this._minDate;
				} else if (selectedDate.isAfter(this._maxDate)) {
					return this._maxDate;
				}
			}

			return selectedDate;
		}
	}, {
		key: 'parseSelectedDates',
		value: function parseSelectedDates(selectedDates) {
			var _selectedDates = [];
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = selectedDates[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var selectedDate = _step2.value;
					// assume we are not given duplicates
					_selectedDates.push(this.parseSelectedDate(selectedDate));
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}

			return _selectedDates;
		}
	}, {
		key: 'updateYears',
		value: function updateYears() {
			var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;

			var min = this._min = moment(props.min);
			var max = this._max = moment(props.max);
			this._minDate = moment(props.minDate);
			this._maxDate = moment(props.maxDate);

			this.years = range(min.year(), max.year() + 1).map(function (year) {
				return getMonthsForYear(year, min, max);
			});
			this.months = [].concat.apply([], this.years);
		}
	}, {
		key: 'updateLocale',
		value: function updateLocale(locale) {
			locale = this.getLocale(locale);
			moment.updateLocale(locale.name, locale);
			moment.locale(locale.name);
		}
	}, {
		key: 'getDisabledDates',
		value: function getDisabledDates(disabledDates) {
			return disabledDates && disabledDates.map(function (date) {
				return moment(date).format('YYYYMMDD');
			});
		}
	}, {
		key: 'getLocale',
		value: function getLocale() {
			var customLocale = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props.locale;

			return Object.assign({}, defaultLocale, customLocale);
		}
	}, {
		key: 'getTheme',
		value: function getTheme() {
			var customTheme = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props.theme;

			return Object.assign({}, defaultTheme, customTheme);
		}
	}, {
		key: 'clearHighlight',
		value: function clearHighlight() {
			if (this.highlightedEl) {
				this.highlightedEl.classList.remove(style.day.highlighted);
				this.highlightedEl = null;
			}
		}
	}, {
		key: 'render',
		value: function render() {
			var _props2 = this.props,
			    className = _props2.className,
			    disabledDays = _props2.disabledDays,
			    height = _props2.height,
			    hideYearsOnSelect = _props2.hideYearsOnSelect,
			    keyboardSupport = _props2.keyboardSupport,
			    layout = _props2.layout,
			    overscanMonthCount = _props2.overscanMonthCount,
			    min = _props2.min,
			    minDate = _props2.minDate,
			    max = _props2.max,
			    maxDate = _props2.maxDate,
			    showTodayHelper = _props2.showTodayHelper,
			    showHeader = _props2.showHeader,
			    tabIndex = _props2.tabIndex,
			    width = _props2.width,
			    other = babelHelpers.objectWithoutProperties(_props2, ['className', 'disabledDays', 'height', 'hideYearsOnSelect', 'keyboardSupport', 'layout', 'overscanMonthCount', 'min', 'minDate', 'max', 'maxDate', 'showTodayHelper', 'showHeader', 'tabIndex', 'width']);

			var disabledDates = this.getDisabledDates(this.props.disabledDates);
			var locale = this.getLocale();
			var theme = this.getTheme();
			var _state = this.state,
			    display = _state.display,
			    isScrolling = _state.isScrolling,
			    selectedDates = _state.selectedDates,
			    showToday = _state.showToday,
			    shouldHeaderAnimate = _state.shouldHeaderAnimate;

			var today = this.today = parseDate(moment());

			console.log('rendering with selected dates');
			console.log("1234Coming");
			console.log(Object.assign([], selectedDates));

			return React.createElement(
				'div',
				{ tabIndex: tabIndex, onKeyDown: keyboardSupport && this.handleKeyDown, className: classNames(className, style.container.root, babelHelpers.defineProperty({}, style.container.landscape, layout == 'landscape')), style: { color: theme.textColor.default, width: width }, 'aria-label': 'Calendar', ref: 'node' },
				React.createElement(
					'div',
					{ className: style.container.wrapper },
					React.createElement(Weekdays, { theme: theme }),
					React.createElement(
						'div',
						{ className: style.container.listWrapper },
						showTodayHelper && React.createElement(Today, { scrollToDate: this.scrollToDate, show: showToday, today: today, theme: theme, locale: locale }),
						React.createElement(List, babelHelpers.extends({
							ref: 'List'
						}, other, {
							width: width,
							height: height,
							selectedDates: selectedDates,
							disabledDates: disabledDates,
							disabledDays: disabledDays,
							months: this.months,
							onDaySelect: this.onDaySelect,
							onScroll: this.onScroll,
							isScrolling: isScrolling,
							today: today,
							min: parseDate(min),
							minDate: parseDate(minDate),
							maxDate: parseDate(maxDate),
							theme: theme,
							locale: locale,
							overscanMonthCount: overscanMonthCount
						}))
					),
					display == 'years' && React.createElement(Years, {
						ref: 'years',
						width: width,
						height: height,
						onDaySelect: this.onDaySelect,
						minDate: minDate,
						maxDate: maxDate,
						selectedDates: selectedDates,
						theme: theme,
						years: range(moment(min).year(), moment(max).year() + 1),
						setDisplay: this.setDisplay,
						scrollToDate: this.scrollToDate,
						hideYearsOnSelect: hideYearsOnSelect
					})
				)
			);
		}
	}]);
	return InfiniteCalendar;
}(Component);

InfiniteCalendar.defaultProps = {
	width: 400,
	height: 500,
	rowHeight: 56,
	overscanMonthCount: 4,
	todayHelperRowOffset: 4,
	layout: 'portrait',
	display: 'days',
	multiDate: false,
	selectedDates: [],
	min: { year: 1980, month: 0, day: 0 },
	minDate: { year: 1980, month: 0, day: 0 },
	max: { year: 2050, month: 11, day: 31 },
	maxDate: { year: 2050, month: 11, day: 31 },
	keyboardSupport: true,
	autoFocus: true,
	shouldHeaderAnimate: true,
	showOverlay: true,
	showTodayHelper: true,
	showHeader: true,
	tabIndex: 1,
	locale: {},
	theme: {},
	hideYearsOnSelect: true
};
InfiniteCalendar.propTypes = {
	selectedDates: PropTypes.arrayOf(validDate),
	multiDate: PropTypes.bool,
	min: validDate,
	max: validDate,
	minDate: validDate,
	maxDate: validDate,
	locale: PropTypes.object,
	theme: PropTypes.object,
	width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	height: PropTypes.number,
	rowHeight: PropTypes.number,
	className: PropTypes.string,
	overscanMonthCount: PropTypes.number,
	todayHelperRowOffset: PropTypes.number,
	disabledDays: PropTypes.arrayOf(PropTypes.number),
	disabledDates: PropTypes.arrayOf(validDate),
	beforeSelect: PropTypes.func,
	onSelect: PropTypes.func,
	afterSelect: PropTypes.func,
	onScroll: PropTypes.func,
	onScrollEnd: PropTypes.func,
	keyboardSupport: PropTypes.bool,
	autoFocus: PropTypes.bool,
	onKeyDown: PropTypes.func,
	tabIndex: PropTypes.number,
	layout: validLayout,
	display: validDisplay,
	hideYearsOnSelect: PropTypes.bool,
	shouldHeaderAnimate: PropTypes.bool,
	showOverlay: PropTypes.bool,
	showTodayHelper: PropTypes.bool,
	showHeader: PropTypes.bool
};
export default InfiniteCalendar;