import {Component, OnInit} from '@angular/core';
import {HttpService, MobileNavState} from '../../http.service';
import {Chart} from 'angular-highcharts';
import {Subscription} from 'rxjs';

@Component({
    selector: 'app-difficulty',
    templateUrl: './difficulty.component.html',
    styleUrls: ['./difficulty.component.scss']
})
export class DifficultyComponent implements OnInit {
    navIsOpen: boolean;
    searchIsOpen: boolean;

    activeChart: string;
    period: string;
    posDifficulty: any;
    chartSubscription: Subscription;
    difficultyChart: Chart;
    seriesData: any;
    loader: boolean;

    // PoS Difficulty
    static drawChart(activeChart, titleText, yText, chartsData): Chart {
        return new Chart({
            chart: {
                type: 'line',
                backgroundColor: '#2b3768',
                height: 700,
                width: null,
                zoomType: 'x',
            },
            title: {
                text: titleText,
                style: {
                    color: '#fff',
                    fontSize: '18px',
                },
            },
            credits: {enabled: false},
            exporting: {enabled: false},
            legend: {
                enabled: false,
                itemStyle: {
                    color: '#9eaacc',
                    fontFamily: 'Helvetica',
                },
                itemHoverStyle: {
                    color: '#9eaacc'
                }
            },
            tooltip: {
                enabled: true,

                valueDecimals: 0,
                xDateFormat: '%Y/%m/%d %H:%M',

                pointFormatter: function () {
                    const point = this;
                    return '<b style="color:' + point.color + '">\u25CF</b> ' + point.series.name + ': <b>' + (point.y) + '</b><br/>';
                },
                crosshairs: true,
                shared: true,
            },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: []
                    },
                    marker: {
                        radius: 2
                    },
                    lineWidth: 2,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null
                }
            },
            xAxis: {
                type: 'datetime',
                labels: {
                    style: {
                        color: '#9eaacc',
                        fontSize: '11px'
                    },
                    format: '{value:%d.%b}'
                },
            },
            yAxis: {
                floor: 0,
                title: {
                    text: yText,
                    style: {
                        color: '#9eaacc'
                    }
                },
                labels: {
                    style: {
                        color: '#9eaacc',
                        fontSize: '11px'
                    },
                },
            },
            navigator: {enabled: true},
            rangeSelector: {
                enabled: true,
                allButtonsEnabled: true,
                buttons: [{
                    type: 'day',
                    count: 1,
                    text: 'day'
                }, {
                    type: 'week',
                    count: 1,
                    text: 'week'
                }, {
                    type: 'month',
                    count: 1,
                    text: 'month'
                }, {
                    type: 'month',
                    count: 3,
                    text: 'quarter'
                }, {
                    type: 'year',
                    count: 1,
                    text: 'year'
                }, {
                    type: 'all',
                    text: 'all'
                }],
                selected: 1,
                labelStyle: {
                    color: '#9eaacc',
                },
                inputStyle: {
                    color: '#9eaacc',
                    backgroundColor: '#2b3768',
                },
                inputBoxBorderColor: '#9eaacc',
                inputBoxWidth: 120,
                inputBoxHeight: 16,
                buttonTheme: {
                    width: 60,
                    fill: '#32439f',
                    style: {
                        color: '#fff',
                        fontSize: '14px',
                        fontFamily: 'Helvetica',
                        fontWeight: '300',
                        opacity: 1,
                    },
                    states: {
                        hover: {
                            fill: '#32439f',
                        },
                        select: {
                            fill: '#32439f',
                            stroke: '#fff',
                            'stroke-width': 1,
                            style: {
                                color: '#fff',
                                opacity: 1,
                                fontWeight: 400,
                            }
                        },
                        disabled: {
                            fill: '#32439f',
                            style: {
                                color: '#fff',
                                opacity: 0.5,
                                fontWeight: 400,
                                cursor: 'default',
                            }
                        }
                    }
                },
            },
            series: chartsData,
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 575,
                    },
                    chartOptions: {
                        chart: {
                            width: 575
                        },
                        rangeSelector: {
                            height: 100,
                            inputPosition: {
                                align: 'left',
                            }
                        }
                    }
                }]
            }
        });
    }


    onIsVisible($event): void {
        this.searchIsOpen = $event;
    }

    constructor(private httpService: HttpService, private mobileNavState: MobileNavState) {
        this.navIsOpen = false;
        this.searchIsOpen = false;
        this.activeChart = 'pos-difficulty';
        this.period = 'all';
    }

    ngOnInit() {
        this.mobileNavState.change.subscribe(navIsOpen => {
            this.navIsOpen = navIsOpen;
        });
        this.initialChart();
    }


    initialChart() {
        this.loader = true;
        if (this.chartSubscription) {
            this.chartSubscription.unsubscribe();
        }
        this.chartSubscription = this.httpService.getChart(this.activeChart, this.period).subscribe(data => {
                this.posDifficulty = data;
                const posDifficultyArray = [];
                for (let i = 1; i < this.posDifficulty.length; i++) {
                    posDifficultyArray.push([this.posDifficulty[i].at * 1000, parseInt(this.posDifficulty[i].d, 10)]);
                }
                this.difficultyChart = DifficultyComponent.drawChart(
                    false,
                    'PoS Difficulty',
                    'PoS Difficulty',
                    this.seriesData = [
                        {type: 'area', name: 'PoS difficulty', data: posDifficultyArray}
                    ]
                );
            }, err => console.log(err),
            () => {
                this.loader = false;
            }
        );
    }
}
