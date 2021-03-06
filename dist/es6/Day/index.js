import React from 'react';
var style = {
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

export default function Day(_ref) {
	var currentYear = _ref.currentYear,
	    date = _ref.date,
	    day = _ref.day,
	    handleDayClick = _ref.handleDayClick,
	    isDisabled = _ref.isDisabled,
	    isToday = _ref.isToday,
	    isSelected = _ref.isSelected,
	    monthShort = _ref.monthShort,
	    locale = _ref.locale,
	    theme = _ref.theme;
	var mmt = date.date,
	    yyyymmdd = date.yyyymmdd;

	var year = mmt.year();

	return React.createElement(
		'li',
		{
			style: isToday ? { color: theme.todayColor } : null,
			className: '' + style.root + (isToday ? ' ' + style.today : '') + (isSelected ? ' ' + style.selected : '') + (isDisabled ? ' ' + style.disabled : ' ' + style.enabled),
			'data-date': yyyymmdd,
			onClick: !isDisabled && handleDayClick ? handleDayClick.bind(this, mmt) : null
		},
		day === 1 && React.createElement(
			'span',
			{ className: style.month },
			monthShort
		),
		React.createElement(
			'span',
			null,
			day
		),
		day === 1 && currentYear !== year && React.createElement(
			'span',
			{ className: style.year },
			year
		),
		isSelected && React.createElement(
			'div',
			{ className: style.selection, style: { backgroundColor: typeof theme.selectionColor == 'function' ? theme.selectionColor(mmt) : theme.selectionColor, color: theme.textColor.active } },
			React.createElement(
				'span',
				{ className: style.month },
				isToday ? locale.todayLabel.short || locale.todayLabel.long : monthShort
			),
			React.createElement(
				'span',
				{ className: style.day },
				day
			)
		)
	);
}