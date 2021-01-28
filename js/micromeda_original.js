/**
 * Created by: Lee Bergstrand (2018)
 * Description: Functions for drawing the genome properties diagram.
 */

let back_end_url = "http://0.0.0.0:5000/";

$(document).ready(function () {
    
    $.getJSON('./configs/application_configuration.json', function (config) {
        back_end_url = config['back_end_url'];

        localforage.config({name: 'micromeda', storeName: 'micromeda_data'});

        localforage.getItem('micromeda-result-key').then(function (result_key) {
            if (result_key === null)
            {
                // here the application speaks to the back-end (server), but it answers that there is no tree. So, I will pass it a Json tree inside the data folder. 
                // 
                get_diagram_data(back_end_url + "genome_properties_tree");
            }
            else
            {
                get_diagram_data(back_end_url + "genome_properties_tree" + '?result_key=' + result_key);
            }
        }).catch(function (err) {
            console.log(err);
        });
    });
});

function get_diagram_data(backend_tree_url)
{
    //$.getJSON(backend_tree_url, function (genome_properties_data) {
    $.getJSON("data/gp_assignments.json", function (genome_properties_data) {
        $.getJSON("configs/diagram_configuration.json", function (diagram_parameters) {
            //let temporal_genome_propertie_data = ;
            let genome_properties_tree = new Genome_Properties_Tree(genome_properties_data);
            genome_properties_tree.reset();
            // Here is the main change!!! for now
            draw_diagram(genome_properties_tree, diagram_parameters);
            //console.log("localforage before update");
            //console.log(localforage);
            update_genome_properties_info(genome_properties_tree.visible_properties());
            
            $(document).ready(function () {
                $('.property_selection').select2(
                    {
                        placeholder: 'Search for properties',
                        theme: "bootstrap4",
                        data: genome_properties_tree.select_data
                    });
            });

            $('.property_selection').on('select2:select', function (event) {
                event.preventDefault();
                let data = event.params.data;
                let genome_property_id = data.id.split('-')[1];
                draw_diagram_expanded_to_property(genome_properties_tree, diagram_parameters, genome_property_id)
            });

            $('.reset').on('click', function () {
                draw_diagram_reset(genome_properties_tree, diagram_parameters)
            });

            $('.expand-all').on('click', function () {
                draw_diagram_expand_all(genome_properties_tree, diagram_parameters)
            });
        });
    });
}


function update_genome_properties_info(genome_property_ids)
{
    for (let id_index in genome_property_ids)
    {
        let current_id = genome_property_ids[id_index];

        localforage.getItem(current_id).then(function (local_genome_properties_data) {
            if (local_genome_properties_data === null)
            {
                let data_url = back_end_url + 'genome_properties/' + current_id;
                jQuery.getJSON(data_url, function (remote_genome_properties_data) {
                    console.log("data_url");
                    console.log(data_url);
                    console.log("remote_genome_properties_data");
                    console.log(remote_genome_properties_data);
                    
                    localforage.setItem(current_id, remote_genome_properties_data).then(function () {
                        
                    }).catch(function (err) {
                        console.log(err);
                    });
                })
            }
        }).catch(function (err) {
            console.log(err);
        });
    }
}

